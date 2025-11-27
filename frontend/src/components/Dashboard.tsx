import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { habitService } from "../services/habitService";
import { userService } from "../services/userService";
import { aiService } from "../services/aiService";
import { Habit } from "../types/habit.model";
import { UserStats, DashboardData } from "../types/user.model";
import "./Dashboard.css";

const CACHE_KEY_PREFIX = "dashboard_data_";
const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

interface CachedDashboardData {
  data: DashboardData;
  timestamp: number;
  userId: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userStats, setUserStats] = useState<UserStats>({
    sustainabilityScore: 0,
    greenPoints: 0,
    badges: [],
  });
  const [recentHabits, setRecentHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(false); // Start with false for instant display
  const [isRefreshing, setIsRefreshing] = useState(false); // Separate state for background refresh
  const [habitAnalysis, setHabitAnalysis] = useState("");
  const [suggestedTips, setSuggestedTips] = useState("");
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    ecoChallengesCompleted: 0,
    carbonSaved: 0,
    streakDays: 0,
    recentActivities: [],
    upcomingChallenges: [],
  });
  const isLoadingRef = useRef(false);

  // Load cached dashboard data
  const loadCachedData = useCallback((userId: string): DashboardData | null => {
    try {
      const cacheKey = `${CACHE_KEY_PREFIX}${userId}`;
      const cached = localStorage.getItem(cacheKey);
      if (!cached) return null;

      const cachedData: CachedDashboardData = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is valid (same user and not expired)
      if (
        cachedData.userId === userId &&
        now - cachedData.timestamp < CACHE_EXPIRY_MS
      ) {
        return cachedData.data;
      }

      // Cache expired, remove it
      localStorage.removeItem(cacheKey);
      return null;
    } catch (error) {
      console.error("Error loading cached dashboard data:", error);
      return null;
    }
  }, []);

  // Save dashboard data to cache
  const saveCachedData = useCallback((userId: string, data: DashboardData) => {
    try {
      const cacheKey = `${CACHE_KEY_PREFIX}${userId}`;
      const cachedData: CachedDashboardData = {
        data,
        timestamp: Date.now(),
        userId,
      };
      localStorage.setItem(cacheKey, JSON.stringify(cachedData));
    } catch (error) {
      console.error("Error saving cached dashboard data:", error);
    }
  }, []);

  // Initialize dashboard data from cache on mount
  useEffect(() => {
    if (user?._id) {
      const cached = loadCachedData(user._id);
      if (cached) {
        setDashboardData(cached);
      }
    }
  }, [user?._id, loadCachedData]);

  const loadUserData = useCallback(
    async (useCache: boolean = true) => {
      if (!user?._id || isLoadingRef.current) return;

      try {
        isLoadingRef.current = true;

        // Try to load cached data first for instant display
        if (useCache) {
          const cachedDashboard = loadCachedData(user._id);
          if (cachedDashboard) {
            setDashboardData(cachedDashboard);
            setIsLoading(false); // Show cached data immediately
          } else {
            setIsLoading(true); // Only show loading if no cache
          }
        } else {
          setIsRefreshing(true); // Background refresh
        }

        // Load user stats (always fetch fresh)
        const stats = await userService.getUserStats(user._id);
        setUserStats(stats);

        // Load dashboard data (includes challenges, carbon saved, streak, activities, and upcoming challenges)
        const dashboard = await userService.getDashboardData(user._id);
        setDashboardData(dashboard);
        saveCachedData(user._id, dashboard); // Cache the fresh data

        // Load user habits
        const habits = await habitService.getUserHabits(user._id);
        setRecentHabits(habits.slice(0, 5));

        // Get AI-powered habit analysis (non-blocking, can fail silently)
        aiService
          .analyzeHabits(user._id)
          .then((analysisResponse) => {
            setHabitAnalysis(analysisResponse.analysis);
          })
          .catch((error) => {
            console.error("Error loading habit analysis:", error);
          });

        // Get sustainability tips (non-blocking, can fail silently)
        aiService
          .getSuggestions(user._id)
          .then((tipsResponse) => {
            setSuggestedTips(tipsResponse.suggestions);
          })
          .catch((error) => {
            console.error("Error loading suggestions:", error);
          });

        setIsLoading(false);
        setIsRefreshing(false);
      } catch (error) {
        console.error("Error loading user data:", error);
        setIsLoading(false);
        setIsRefreshing(false);
      } finally {
        isLoadingRef.current = false;
      }
    },
    [user?._id, loadCachedData, saveCachedData]
  );

  useEffect(() => {
    if (user?._id) {
      // Load with cache first for instant display
      loadUserData(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

  const formatDate = (date: Date | string): string => {
    return new Date(date).toLocaleDateString();
  };

  const navigateTo = (route: string) => {
    navigate(route);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.name || "Eco Warrior"}!</h1>
        <p className="subtitle">Your sustainability journey at a glance</p>
      </div>

      {/* Stats Cards */}
      <div className="row stats-row">
        <div className="col-md-4">
          <div className="stats-card">
            <div className="stats-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="stats-data">
              <h2>{dashboardData.ecoChallengesCompleted}</h2>
              <p>Eco Challenges Completed</p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="stats-card">
            <div className="stats-icon">
              <i className="fas fa-leaf"></i>
            </div>
            <div className="stats-data">
              <h2>{dashboardData.carbonSaved}kg</h2>
              <p>Carbon Footprint Saved</p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="stats-card">
            <div className="stats-icon">
              <i className="fas fa-fire"></i>
            </div>
            <div className="stats-data">
              <h2>{dashboardData.streakDays}</h2>
              <p>Day Streak</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="row main-content">
        {/* Recent Activity */}
        <div className="col-md-6">
          <div className="content-card">
            <h3>
              <i className="fas fa-history"></i> Recent Activity
            </h3>
            <div className="activity-list">
              {isLoading ? (
                <div className="no-data">Loading activities...</div>
              ) : dashboardData.recentActivities.length === 0 ? (
                <div className="no-data">
                  No recent activities yet. Start your eco journey!
                </div>
              ) : (
                <>
                  {isRefreshing && (
                    <div
                      className="refreshing-indicator"
                      style={{
                        fontSize: "0.875rem",
                        color: "#6c757d",
                        marginBottom: "0.5rem",
                        textAlign: "center",
                      }}
                    >
                      <i
                        className="fas fa-sync fa-spin"
                        style={{ marginRight: "0.5rem" }}
                      ></i>
                      Updating...
                    </div>
                  )}
                  {dashboardData.recentActivities.map((activity, index) => (
                    <div key={index} className="activity-item">
                      <div className="activity-icon">
                        <i className="fas fa-check"></i>
                      </div>
                      <div className="activity-details">
                        <strong>{activity.action}</strong>
                        <p>{activity.description}</p>
                        <small>{formatDate(activity.date)}</small>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Upcoming Challenges */}
        <div className="col-md-6">
          <div className="content-card">
            <h3>
              <i className="fas fa-trophy"></i> Upcoming Challenges
            </h3>
            <div className="challenges-list">
              {isLoading ? (
                <div className="no-data">Loading challenges...</div>
              ) : dashboardData.upcomingChallenges.length === 0 ? (
                <div className="no-data">
                  No upcoming challenges. Check back soon!
                </div>
              ) : (
                <>
                  {isRefreshing && (
                    <div
                      className="refreshing-indicator"
                      style={{
                        fontSize: "0.875rem",
                        color: "#6c757d",
                        marginBottom: "0.5rem",
                        textAlign: "center",
                      }}
                    >
                      <i
                        className="fas fa-sync fa-spin"
                        style={{ marginRight: "0.5rem" }}
                      ></i>
                      Updating...
                    </div>
                  )}
                  {dashboardData.upcomingChallenges.map((challenge, index) => (
                    <div key={index} className="challenge-item">
                      <h4>{challenge.title}</h4>
                      <p>{challenge.description}</p>
                      <span className="impact-badge">{challenge.impact}</span>
                      <button className="btn btn-sm btn-outline-success">
                        Accept Challenge
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row">
        <div className="col-12">
          <div className="quick-actions">
            <h3>Quick Actions</h3>
            <div className="action-buttons">
              <button
                className="btn btn-primary"
                onClick={() => navigateTo("/habits/new")}
              >
                <i className="fas fa-plus"></i> Add New Habit
              </button>
              <button
                className="btn btn-outline-primary"
                onClick={() => navigateTo("/calculator")}
              >
                <i className="fas fa-calculator"></i> Calculate Footprint
              </button>
              <button
                className="btn btn-outline-primary"
                onClick={() => navigateTo("/chat")}
              >
                <i className="fas fa-comment"></i> Chat with EcoWise AI
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
