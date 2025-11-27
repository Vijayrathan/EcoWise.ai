const User = require("../models/User");
const Habit = require("../models/Habit");
const jwt = require("jsonwebtoken");

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    const usersWithName = users.map(user => {
      const userObj = user.toObject();
      userObj.name = user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : user.firstName || user.username;
      return userObj;
    });
    res.status(200).json(usersWithName);
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userResponse = user.toObject();
    // Add name field (firstName + lastName, or username as fallback)
    userResponse.name = user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName || user.username;

    res.status(200).json(userResponse);
  } catch (error) {
    console.error("Error getting user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Register new user
exports.registerUser = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    // In a production app, password should be hashed
    const user = new User({
      username,
      email,
      password, // In production, hash this password
      firstName,
      lastName,
      // Default values for other fields are set in the model
    });

    await user.save();

    // Don't return password
    const userResponse = { ...user.toObject() };
    delete userResponse.password;
    
    // Add name field (firstName + lastName, or username as fallback)
    userResponse.name = user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName || user.username;

    res.status(201).json(userResponse);
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Login user
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check password (in production, compare hashed passwords)
    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Update last active
    user.lastActive = Date.now();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Don't return password
    const userResponse = { ...user.toObject() };
    delete userResponse.password;
    
    // Add name field (firstName + lastName, or username as fallback)
    userResponse.name = user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName || user.username;

    // Send both user data and token
    res.status(200).json({
      user: userResponse,
      token
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;

    // Find user and update
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { firstName, lastName, email },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userResponse = user.toObject();
    // Add name field (firstName + lastName, or username as fallback)
    userResponse.name = user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName || user.username;

    res.status(200).json(userResponse);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get user sustainability stats
exports.getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "sustainabilityScore greenPoints badges"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      sustainabilityScore: user.sustainabilityScore,
      greenPoints: user.greenPoints,
      badges: user.badges,
    });
  } catch (error) {
    console.error("Error getting user stats:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get user badges
exports.getUserBadges = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("badges");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ badges: user.badges });
  } catch (error) {
    console.error("Error getting user badges:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update user preferences
exports.updateUserPreferences = async (req, res) => {
  try {
    const { goalPreferences } = req.body;

    // Update user preferences
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { goalPreferences },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userResponse = user.toObject();
    // Add name field (firstName + lastName, or username as fallback)
    userResponse.name = user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName || user.username;

    res.status(200).json(userResponse);
  } catch (error) {
    console.error("Error updating user preferences:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get dashboard data for user
exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.params.id;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get all habits for the user
    const habits = await Habit.find({ user: userId }).sort({ date: -1 });

    // Calculate challenges completed (completed habits)
    const completedHabits = habits.filter((h) => h.isCompleted);
    const ecoChallengesCompleted = completedHabits.length;

    // Calculate carbon saved (sum of carbonFootprint from completed habits)
    const carbonSaved = completedHabits.reduce(
      (sum, habit) => sum + (habit.carbonFootprint || 0),
      0
    );

    // Calculate day streak (consecutive days with completed habits)
    let streakDays = 0;
    if (completedHabits.length > 0) {
      // Get unique dates with completions
      const completionDates = new Set();
      completedHabits
        .filter((h) => h.completedDate)
        .forEach((h) => {
          const date = new Date(h.completedDate);
          date.setHours(0, 0, 0, 0);
          completionDates.add(date.getTime());
        });

      if (completionDates.size > 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // Check if today or yesterday has a completion to start the streak
        const hasToday = completionDates.has(today.getTime());
        const hasYesterday = completionDates.has(yesterday.getTime());

        if (hasToday || hasYesterday) {
          // Start counting from the most recent day with a completion
          let checkDate = hasToday ? new Date(today) : new Date(yesterday);
          streakDays = 1;

          // Count backwards day by day
          while (streakDays < 365) {
            checkDate.setDate(checkDate.getDate() - 1);
            if (completionDates.has(checkDate.getTime())) {
              streakDays++;
            } else {
              break;
            }
          }
        }
      }
    }

    // Get recent activities (last 10 habits, both completed and new)
    const recentActivities = habits.slice(0, 10).map((habit) => {
      if (habit.isCompleted && habit.completedDate) {
        return {
          action: "Completed challenge",
          description: habit.description,
          date: habit.completedDate,
        };
      } else {
        return {
          action: "New habit",
          description: habit.description,
          date: habit.date || habit.createdAt,
        };
      }
    });

    // Generate upcoming challenges based on user's habits and preferences
    const upcomingChallenges = generateUpcomingChallenges(user, habits);

    res.status(200).json({
      ecoChallengesCompleted,
      carbonSaved: Math.round(carbonSaved * 10) / 10, // Round to 1 decimal place
      streakDays,
      recentActivities,
      upcomingChallenges,
    });
  } catch (error) {
    console.error("Error getting dashboard data:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Helper function to generate upcoming challenges
function generateUpcomingChallenges(user, habits) {
  const challenges = [];
  const completedCategories = new Set(
    habits.filter((h) => h.isCompleted).map((h) => h.category)
  );
  const allCategories = new Set(habits.map((h) => h.category));

  // Challenge pool based on categories
  const challengePool = [
    {
      title: "Meatless Monday",
      description: "Skip meat for a full day",
      impact: "Saves ~8kg of CO2",
      category: "diet",
    },
    {
      title: "Energy Saver",
      description: "Reduce electricity usage by 10%",
      impact: "Saves ~5kg of CO2",
      category: "energy",
    },
    {
      title: "Zero Waste Day",
      description: "Produce no waste for 24 hours",
      impact: "Prevents landfill waste",
      category: "waste",
    },
    {
      title: "Public Transport Day",
      description: "Use only public transport or bike",
      impact: "Saves ~3kg of CO2",
      category: "transport",
    },
    {
      title: "Water Conservation",
      description: "Reduce water usage by 20%",
      impact: "Saves ~2kg of CO2",
      category: "water",
    },
    {
      title: "Plastic-Free Day",
      description: "Avoid all single-use plastic",
      impact: "Prevents plastic waste",
      category: "waste",
    },
  ];

  // Filter challenges based on user's activity
  // Prioritize challenges in categories the user hasn't completed yet
  const suggestedChallenges = challengePool
    .filter((challenge) => {
      // If user has no habits in this category, suggest it
      if (!allCategories.has(challenge.category)) {
        return true;
      }
      // If user hasn't completed this category, suggest it
      if (!completedCategories.has(challenge.category)) {
        return true;
      }
      // Otherwise, include it as a repeat challenge
      return true;
    })
    .slice(0, 3); // Return top 3

  return suggestedChallenges;
}
