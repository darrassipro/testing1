const express = require("express");
const GamificationRouter = express.Router();
const GamificationController = require("../controllers/gamificationController");
const { authenticateToken } = require("../middleware/auth");

GamificationRouter.post(
	"/create",
	GamificationController.createGamificationRule
);

GamificationRouter.patch(
	"/update",
	GamificationController.updateGamificationRule
);

GamificationRouter.post(
	"/complete-gamification",
	GamificationController.completeGamificatedTask
);

// Get gamification profile for authenticated user
GamificationRouter.get(
	"/profile",
	authenticateToken,
	GamificationController.getGamificationProfile
);

// Get leaderboard
GamificationRouter.get(
	"/leaderboard",
	GamificationController.getLeaderboard
);

module.exports = { GamificationRouter };
