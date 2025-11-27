const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// GET /api/users - Get all users (admin only)
router.get("/", userController.getAllUsers);

// GET /api/users/:id - Get user by ID
router.get("/:id", userController.getUserById);

// POST /api/users/register - Register new user
router.post("/register", userController.registerUser);

// POST /api/users/login - Login user
router.post("/login", userController.loginUser);

// PUT /api/users/:id - Update user
router.put("/:id", userController.updateUser);

// GET /api/users/:id/stats - Get user sustainability stats
router.get("/:id/stats", userController.getUserStats);

// GET /api/users/:id/badges - Get user badges
router.get("/:id/badges", userController.getUserBadges);

// GET /api/users/:id/dashboard - Get dashboard data
router.get("/:id/dashboard", userController.getDashboardData);

// POST /api/users/:id/preferences - Update user preferences
router.post("/:id/preferences", userController.updateUserPreferences);

module.exports = router;
