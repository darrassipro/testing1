const xss = require("xss");
const { GamificationRule } = require("../models");
const { GAMIFICATIONS_ENUM } = require("../constants/gamifications");
const PointsTransaction = require("../models/PointsTransaction");
const { User } = require("../models/User");

/**
 * Create a new gamification rule.
 * Expects: points, descriptionAr, descriptionFr, description, isActive, activity: enum(
				"COMPLETE_REGISTRATION",
				"COMPLETE_CIRCUIT",
				"COMPLETE_PREMIUM_CIRCUIT",
				"SHARE_WITH_FRIEND",
				"LEAVE_REVIEW",
				"VISIT_POI") in req.body
 */
async function createGamificationRule(req, res) {
	try {
		const {
			points,
			activity,
			isActive,
			description,
			descriptionAr,
			descriptionFr,
		} = req.body;

		[(null, undefined)].forEach((el) => {
			if (
				[
					points,
					activity,
					isActive,
					description,
					descriptionAr,
					descriptionFr,
				].includes(el)
			) {
				res.status(400).json({
					status: "failure",
					data: "failed to create gamification rule, arguments missing",
				});
				return;
			}
		});
		if (
			![
				"COMPLETE_REGISTRATION",
				"COMPLETE_CIRCUIT",
				"COMPLETE_PREMIUM_CIRCUIT",
				"SHARE_WITH_FRIEND",
				"LEAVE_REVIEW",
				"VISIT_POI",
			].includes(activity)
		) {
			res.status(400).json({
				status: "failure",
				data: "invalid value for field activity",
			});
			return;
		}
		const gamification_rule = await GamificationRule.create({
			points,
			activity,
			isActive,
			description: xss(description),
			descriptionAr: xss(descriptionAr),
			descriptionFr: xss(descriptionFr),
		});

		res.status(201).json({ status: "success", data: gamification_rule });
	} catch (error) {
		console.error("server erreur in gamification rule creation:", error);
		res.status(500).json({
			status: "server_failure",
			message: "Server Error",
		});
	}
}
/**
 * Update an existing gamification rule.
 * Expects: id in req.body, and any of points, descriptionAr, descriptionFr, description, isActive, activity in req.body to update.
 */
async function updateGamificationRule(req, res) {
	try {
		const {
			id,
			points,
			activity,
			isActive,
			description,
			descriptionAr,
			descriptionFr,
		} = req.body;

		if (!id) {
			return res.status(400).json({
				status: "failure",
				data: "id is required to update gamification rule",
			});
		}

		const updateFields = {};
		if (points !== undefined) updateFields.points = points;
		if (activity !== undefined) {
			if (!GAMIFICATIONS_ENUM.includes(activity)) {
				return res.status(400).json({
					status: "failure",
					data: "invalid value for field activity",
				});
			}
			updateFields.activity = activity;
		}
		if (isActive !== undefined) updateFields.isActive = isActive;
		if (description !== undefined)
			updateFields.description = xss(description);
		if (descriptionAr !== undefined)
			updateFields.descriptionAr = xss(descriptionAr);
		if (descriptionFr !== undefined)
			updateFields.descriptionFr = xss(descriptionFr);

		const [updatedRowsCount, updatedRows] = await GamificationRule.update(
			updateFields,
			{
				where: { id },
				returning: true,
			}
		);

		if (updatedRowsCount === 0) {
			return res.status(404).json({
				status: "failure",
				data: "gamification rule not found",
			});
		}
		res.status(200).json({ status: "success", data: updatedRows[0] });
	} catch (error) {
		console.error("server error in gamification rule update:", error);
		res.status(500).json({
			status: "server_failure",
			message: "Server Error",
		});
	}
}
async function getGamificationByName(gamification) {
	if (!gamification || !GAMIFICATIONS_ENUM.includes(gamification)) {
		throw new Error("invalid gamification name");
	}
	const gamificationRule = await GamificationRule.findOne({
		where: { activity: gamification },
	});
	return gamificationRule;
}

async function completeGamificatedTask(req, res) {
	try {
		const { userId, gamificationRuleName } = req.body;
		if (!userId || !GAMIFICATIONS_ENUM.includes(gamificationRuleName)) {
			res.status(400).json({
				status: "failure",
				data: "enter valid values for user id and gamification rule",
			});
			return;
		}
		const userExist = await User.findOne({ where: { id: userId } });
		if (!userExist) {
			return res.status(404).json({
				status: "failure",
				data: "user not found",
			});
		}
		const gamificationRule = await getGamificationByName(
			gamificationRuleName
		);
		const pointsTransaction = await PointsTransaction.create({
			userId,
			points: gamificationRule.points,
			activity,
			description: gamificationRule.description,
			descriptionAr: gamificationRule.descriptionAr,
			descriptionFr: gamificationRule.descriptionFr,
		});
		//update user points INCREMENT
		res.status(201).json({ status: "success", data: pointsTransaction });
	} catch (error) {
		res.status(500).json({
			status: "failure",
			data: "server error occured",
		});
	}
}
async function name(params) {
	//update user points DECREMENT
}

/**
 * Get gamification profile for the authenticated user
 * Returns user points and badges
 */
async function getGamificationProfile(req, res) {
	try {
		const userId = req.user.userId;

		// Get user
		const user = await User.findByPk(userId, {
			attributes: ['id', 'firstName', 'lastName', 'profileImage'],
			include: [
				{
					model: require('../models').Badge,
					as: 'badges',
					through: { 
						attributes: ['earnedAt'],
						as: 'userBadge'
					},
				},
			],
		});

		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
			});
		}

		// Calculate total points from transactions
		const transactions = await PointsTransaction.findAll({
			where: { userId },
			attributes: ['points'],
		});

		const totalPoints = transactions.reduce((sum, t) => sum + t.points, 0);
		
		// Calculate level (100 points per level)
		const level = Math.floor(totalPoints / 100) + 1;

		res.status(200).json({
			success: true,
			data: {
				points: {
					totalPoints,
					level,
				},
				badges: user.badges || [],
			},
		});
	} catch (error) {
		console.error('Error fetching gamification profile:', error);
		res.status(500).json({
			success: false,
			message: 'Server Error',
		});
	}
}

/**
 * Get leaderboard
 * Returns top users by points
 */
async function getLeaderboard(req, res) {
	try {
		const limit = parseInt(req.query.limit) || 10;

		// Get all users with their total points from transactions
		const users = await User.findAll({
			attributes: ['id', 'firstName', 'lastName', 'profileImage'],
		});

		// Calculate points for each user
		const usersWithPoints = await Promise.all(
			users.map(async (user) => {
				const transactions = await PointsTransaction.findAll({
					where: { userId: user.id },
					attributes: ['points'],
				});

				const totalPoints = transactions.reduce((sum, t) => sum + t.points, 0);
				const level = Math.floor(totalPoints / 100) + 1;

				return {
					user: {
						firstName: user.firstName,
						lastName: user.lastName,
						profileImage: user.profileImage,
					},
					totalPoints,
					level,
				};
			})
		);

		// Sort by points and take top N
		const leaderboard = usersWithPoints
			.sort((a, b) => b.totalPoints - a.totalPoints)
			.slice(0, limit);

		res.status(200).json({
			success: true,
			data: leaderboard,
		});
	} catch (error) {
		console.error('Error fetching leaderboard:', error);
		res.status(500).json({
			success: false,
			message: 'Server Error',
		});
	}
}

module.exports = {
	createGamificationRule,
	updateGamificationRule,
	completeGamificatedTask,
	getGamificationProfile,
	getLeaderboard,
};
