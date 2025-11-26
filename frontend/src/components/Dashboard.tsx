import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { habitService } from '../services/habitService';
import { userService } from '../services/userService';
import { aiService } from '../services/aiService';
import { Habit } from '../types/habit.model';
import { UserStats } from '../types/user.model';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userStats, setUserStats] = useState<UserStats>({
    sustainabilityScore: 0,
    greenPoints: 0,
    badges: [],
  });
  const [recentHabits, setRecentHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [habitAnalysis, setHabitAnalysis] = useState('');
  const [suggestedTips, setSuggestedTips] = useState('');
  const [ecoChallengesCompleted, setEcoChallengesCompleted] = useState(12);
  const [carbonSaved, setCarbonSaved] = useState(127);
  const [streakDays, setStreakDays] = useState(8);

  const recentActivities = [
    {
      action: 'Completed challenge',
      description: 'Avoided single-use plastic for a day',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      action: 'New habit',
      description: 'Started tracking public transport usage',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      action: 'Completed challenge',
      description: 'Used reusable grocery bags for shopping',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
  ];

  const upcomingChallenges = [
    {
      title: 'Meatless Monday',
      description: 'Skip meat for a full day',
      impact: 'Saves ~8kg of CO2',
    },
    {
      title: 'Energy Saver',
      description: 'Reduce electricity usage by 10%',
      impact: 'Saves ~5kg of CO2',
    },
    {
      title: 'Zero Waste Day',
      description: 'Produce no waste for 24 hours',
      impact: 'Prevents landfill waste',
    },
  ];

  useEffect(() => {
    if (user && user._id) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user?._id) return;

    try {
      setIsLoading(true);

      // Load user stats
      const stats = await userService.getUserStats(user._id);
      setUserStats(stats);

      // Load user habits
      const habits = await habitService.getUserHabits(user._id);
      setRecentHabits(habits.slice(0, 5));

      // Get AI-powered habit analysis
      try {
        const analysisResponse = await aiService.analyzeHabits(user._id);
        setHabitAnalysis(analysisResponse.analysis);
      } catch (error) {
        console.error('Error loading habit analysis:', error);
      }

      // Get sustainability tips
      try {
        const tipsResponse = await aiService.getSuggestions(user._id);
        setSuggestedTips(tipsResponse.suggestions);
      } catch (error) {
        console.error('Error loading suggestions:', error);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error loading user data:', error);
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date | string): string => {
    return new Date(date).toLocaleDateString();
  };

  const navigateTo = (route: string) => {
    navigate(route);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.name || 'Eco Warrior'}!</h1>
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
              <h2>{ecoChallengesCompleted}</h2>
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
              <h2>{carbonSaved}kg</h2>
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
              <h2>{streakDays}</h2>
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
              {recentActivities.length === 0 ? (
                <div className="no-data">No recent activities yet. Start your eco journey!</div>
              ) : (
                recentActivities.map((activity, index) => (
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
                ))
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
              {upcomingChallenges.length === 0 ? (
                <div className="no-data">No upcoming challenges. Check back soon!</div>
              ) : (
                upcomingChallenges.map((challenge, index) => (
                  <div key={index} className="challenge-item">
                    <h4>{challenge.title}</h4>
                    <p>{challenge.description}</p>
                    <span className="impact-badge">{challenge.impact}</span>
                    <button className="btn btn-sm btn-outline-success">Accept Challenge</button>
                  </div>
                ))
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
              <button className="btn btn-primary" onClick={() => navigateTo('/habits/new')}>
                <i className="fas fa-plus"></i> Add New Habit
              </button>
              <button className="btn btn-outline-primary" onClick={() => navigateTo('/calculator')}>
                <i className="fas fa-calculator"></i> Calculate Footprint
              </button>
              <button className="btn btn-outline-primary" onClick={() => navigateTo('/chat')}>
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

