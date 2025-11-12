# 🎮 GO-FEZ Gamification System

## Overview
A comprehensive gamification system designed to increase user engagement and create addictive usage patterns through rewards, achievements, and progression.

## 📊 Point System

### Level Progression
- **Level 1**: 0-99 points
- **Level 2**: 100-249 points  
- **Level 3**: 250-499 points
- **Level 4+**: Every 250 points

## 🏆 Activity Rewards

### 👤 Registration & Profile (High rewards to encourage completion)
| Activity | Points | Description |
|----------|--------|-------------|
| COMPLETE_REGISTRATION | 50 | Welcome bonus for completing registration |
| COMPLETE_PROFILE | 30 | Complete your profile with all details |
| ADD_PROFILE_PICTURE | 20 | Add a profile picture |

### 🗺️ Circuit Activities (Main engagement driver)
| Activity | Points | Description |
|----------|--------|-------------|
| COMPLETE_CIRCUIT | 100 | Complete a standard circuit |
| COMPLETE_PREMIUM_CIRCUIT | 150 | Complete a premium circuit |
| COMPLETE_FIRST_CIRCUIT | 200 | 🎯 Milestone: Complete your first circuit |
| COMPLETE_5_CIRCUITS | 300 | 🎯 Milestone: Complete 5 circuits - Explorer! |
| COMPLETE_10_CIRCUITS | 500 | 🎯 Milestone: Complete 10 circuits - Master Explorer! |
| CREATE_CUSTOM_CIRCUIT | 75 | Create your own custom circuit |

### 📍 POI Interactions (Frequent micro-rewards)
| Activity | Points | Description |
|----------|--------|-------------|
| VISIT_POI | 10 | Visit a point of interest |
| VISIT_FIRST_POI | 50 | 🎯 Milestone: Visit your first POI |
| VISIT_5_POIS | 100 | 🎯 Milestone: Visit 5 POIs |
| VISIT_10_POIS | 200 | 🎯 Milestone: Visit 10 POIs |
| VISIT_25_POIS | 400 | 🎯 Milestone: Visit 25 POIs - Adventurer! |
| VISIT_50_POIS | 750 | 🎯 Milestone: Visit 50 POIs - Legend! |
| SAVE_POI | 5 | Save a POI to favorites |
| CHECK_IN_POI | 15 | Check in at a POI |

### 💬 Social Activities (Encourage sharing and reviews)
| Activity | Points | Description |
|----------|--------|-------------|
| SHARE_WITH_FRIEND | 25 | Share a circuit or POI with a friend |
| LEAVE_REVIEW | 20 | Leave a review |
| FIRST_REVIEW | 50 | 🎯 Milestone: Leave your first review |
| LEAVE_5_REVIEWS | 150 | 🎯 Milestone: Leave 5 reviews - Helpful Contributor! |
| HELPFUL_REVIEW | 10 | Someone found your review helpful |
| PHOTOGRAPHY_LOVER | 35 | Upload a photo at a POI |
| LOCAL_GUIDE | 50 | Write a detailed review (100+ characters) |
| SOCIAL_BUTTERFLY | 100 | Share 10 times with friends |

### 📅 Daily/Streak Activities (Build habit)
| Activity | Points | Description |
|----------|--------|-------------|
| DAILY_LOGIN | 15 | Daily login bonus |
| WEEKLY_STREAK | 150 | 🔥 7-day consecutive login streak |
| MONTHLY_STREAK | 500 | 🔥 30-day consecutive login streak - Dedicated! |

### 🌍 Discovery & Exploration (Time-based bonuses)
| Activity | Points | Description |
|----------|--------|-------------|
| DISCOVER_NEW_CITY | 100 | Visit a new city |
| VISIT_ALL_CATEGORIES | 300 | Visit POIs from all categories |
| NIGHT_EXPLORER | 30 | ⭐ Bonus: Visit a POI at night (after 8pm) |
| EARLY_BIRD | 25 | ⭐ Bonus: Visit a POI early morning (5am-8am) |
| WEEKEND_WARRIOR | 20 | ⭐ Bonus: Visit a POI on the weekend |

### 🤝 Partner Activities
| Activity | Points | Description |
|----------|--------|-------------|
| VISIT_PARTNER | 40 | Visit a partner location |
| SCAN_QR_CODE | 20 | Scan a QR code at a location |

## 🎯 Engagement Strategies

### 1. **Immediate Gratification**
- Small rewards (5-20 points) for quick actions
- Instant feedback on every activity
- Visual progress indicators

### 2. **Milestone Celebrations**
- Bonus rewards for reaching milestones (1st, 5th, 10th, etc.)
- Special notifications for achievements
- Increasing rewards for higher milestones

### 3. **Daily Habits**
- Login streak bonuses (daily, weekly, monthly)
- Streak counter to create fear of loss
- Automatic tracking of consecutive days

### 4. **Time-Based Challenges**
- Night Explorer bonus (after 8pm)
- Early Bird bonus (5am-8am)  
- Weekend Warrior bonus
- Creates urgency and variety

### 5. **Social Reinforcement**
- Points for sharing with friends
- Rewards when others find your reviews helpful
- Leaderboard competition

### 6. **Variable Rewards**
- Different point values create anticipation
- Unexpected bonuses (time-based, milestone-based)
- Multiple reward paths

## 🔄 Implementation Details

### Automatic Triggers

1. **On User Login**
   - Check daily login streak
   - Award daily login bonus
   - Update last login date
   - Check for weekly/monthly streaks

2. **On POI Visit**
   - Award base POI visit points (10)
   - Check milestone achievements
   - Check time-based bonuses
   - Track visit count

3. **On Circuit Completion**
   - Award circuit completion points
   - Check if premium circuit
   - Check milestone achievements
   - Calculate total time

4. **On Review Submission**
   - Award review points (20)
   - Check if first review
   - Bonus for detailed reviews (100+ chars)
   - Bonus for photo uploads

5. **On Share**
   - Award share points
   - Track share count
   - Check for Social Butterfly milestone

### Database Structure

**PointsTransaction Table:**
- `id`: UUID
- `userId`: Integer (FK to User)
- `gamificationRuleId`: UUID (FK to GamificationRule)
- `points`: Integer (can be negative for penalties)
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

**User Table (Additional Fields):**
- `lastLoginDate`: Date
- `loginStreak`: Integer (consecutive days)

## 📱 Frontend Integration

### Display Components

1. **Profile Page**
   - Total points display
   - Current level with progress bar
   - Points to next level
   - Recent activities feed
   - Badge collection

2. **Leaderboard**
   - Top users by points
   - User's rank
   - Weekly/monthly rankings

3. **Achievement Notifications**
   - Toast notifications for points earned
   - Celebration animations for milestones
   - Level-up animations

4. **Activity Feed**
   - Recent point transactions
   - Activity descriptions in user's language
   - Time stamps

## 🎨 Psychology Behind Design

### Addictive Patterns Used:

1. **Variable Ratio Rewards**: Not every action gives the same points, creating anticipation
2. **Progress Bars**: Visual representation of advancement creates completion desire
3. **Loss Aversion**: Streak bonuses create fear of breaking the chain
4. **Social Proof**: Leaderboard creates competition and FOMO
5. **Micro-commitments**: Small actions (5 points) lead to larger commitments
6. **Milestone Satisfaction**: Chunked progression feels achievable
7. **Immediate Feedback**: Instant rewards create dopamine response
8. **Multiple Paths**: Different ways to earn points keeps engagement fresh

## 🚀 Future Enhancements

1. **Badges System**: Visual collectibles for achievements
2. **Challenges**: Daily/weekly challenges for bonus points
3. **Seasons**: Reset leaderboard periodically with special rewards
4. **Referral Bonuses**: Points for inviting friends
5. **Power-ups**: Spend points on special features
6. **Achievements Showcase**: Public profile display
7. **Team Challenges**: Group competitions
8. **Lucky Draws**: Random bonus points events

## 📈 Success Metrics

Track these KPIs to measure gamification success:
- Daily Active Users (DAU)
- User Retention Rate
- Average Session Duration
- Actions per Session
- Streak Participation Rate
- POI Visit Frequency
- Review Submission Rate
- Share Rate
- Time to First Action

## 🔧 API Endpoints

### Get User Points
```http
GET /api/gamification/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "points": {
      "totalPoints": 450,
      "level": 3
    },
    "badges": []
  }
}
```

### Get Leaderboard
```http
GET /api/gamification/leaderboard?limit=10
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "user": {
        "firstName": "John",
        "lastName": "Doe",
        "profileImage": "https://..."
      },
      "totalPoints": 1250,
      "level": 5
    }
  ]
}
```

## 💡 Tips for Maximum Engagement

1. **Show Progress Everywhere**: Display points/level in header
2. **Celebrate Wins**: Animations and sounds for point gains
3. **Create Urgency**: "Visit 2 more POIs for 100 bonus points!"
4. **Daily Goals**: "You're on a 5-day streak! Don't break it!"
5. **Near-Miss Effects**: "Only 50 points to next level!"
6. **Social Comparison**: "You're #15 on the leaderboard!"
7. **Personalization**: Suggest activities based on user behavior
8. **Gamify Onboarding**: Quick points for completing profile

---

**Remember**: The goal is to make users feel accomplished and motivated to return. Balance challenge with achievability, and always provide clear next steps!
