import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { habitService } from '../services/habitService';
import { Habit, HabitCategory } from '../types/habit.model';
import './HabitsList.css';

const HabitsList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const categories: HabitCategory[] = ['transport', 'energy', 'diet', 'waste', 'water', 'other'];

  useEffect(() => {
    if (user?._id) {
      loadHabits();
    }
  }, [user]);

  const loadHabits = async () => {
    if (!user?._id) return;

    setLoading(true);
    try {
      const data = await habitService.getUserHabits(user._id);
      setHabits(data);
    } catch (error) {
      console.error('Error fetching habits:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterByCategory = (): Habit[] => {
    let filtered = habits;
    if (selectedCategory) {
      filtered = habits.filter((habit) => habit.category === selectedCategory);
    }
    return sortHabits(filtered);
  };

  const sortHabits = (habitsToSort: Habit[]): Habit[] => {
    return [...habitsToSort].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'impact':
        case 'carbonFootprint':
          comparison = (a.carbonFootprint || 0) - (b.carbonFootprint || 0);
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'completed':
          comparison = a.isCompleted === b.isCompleted ? 0 : a.isCompleted ? -1 : 1;
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const completeHabit = async (habit: Habit) => {
    if (!habit._id) return;

    // Optimistic update
    setHabits((prev) =>
      prev.map((h) => (h._id === habit._id ? { ...h, isCompleted: true } : h))
    );

    try {
      const response = await habitService.completeHabit(habit._id);
      if (response.habit) {
        setHabits((prev) =>
          prev.map((h) => (h._id === habit._id ? response.habit : h))
        );
      }
    } catch (error) {
      console.error('Error completing habit:', error);
      // Revert on error
      setHabits((prev) =>
        prev.map((h) => (h._id === habit._id ? { ...h, isCompleted: false } : h))
      );
    }
  };

  const deleteHabit = async (habitId: string) => {
    try {
      await habitService.deleteHabit(habitId);
      setHabits((prev) => prev.filter((h) => h._id !== habitId));
    } catch (error) {
      console.error('Error deleting habit:', error);
    }
  };

  const getCategoryClass = (category: string): string => {
    const classMap: { [key: string]: string } = {
      transport: 'category-transport',
      energy: 'category-energy',
      diet: 'category-food',
      waste: 'category-waste',
      water: 'category-water',
      other: 'category-shopping',
    };
    return classMap[category] || '';
  };

  const formatDate = (date: Date | string): string => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="habits-container">
      <div className="habits-header">
        <h1>
          <i className="fas fa-leaf"></i> Sustainable Habits
        </h1>
        <p>Track your eco-friendly habits and see your impact grow</p>
        <button onClick={() => navigate('/habits/new')} className="btn btn-primary add-habit-btn">
          <i className="fas fa-plus"></i> Add New Habit
        </button>
      </div>

      <div className="habits-filters">
        <div className="filter-group">
          <label htmlFor="categoryFilter">Filter by category:</label>
          <select
            id="categoryFilter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="form-select"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="sortBy">Sort by:</label>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <select
              id="sortBy"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-select"
              style={{ marginRight: '0.5rem' }}
            >
              <option value="date">Date</option>
              <option value="impact">Environmental Impact</option>
              <option value="category">Category</option>
              <option value="completed">Completion Status</option>
            </select>
            <button onClick={toggleSortOrder} className="btn btn-sm btn-outline-secondary sort-direction">
              <i className={`fas fa-arrow-${sortOrder === 'asc' ? 'up' : 'down'}`}></i>
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="loading-container">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading your habits...</p>
        </div>
      )}

      {!loading && habits.length === 0 && (
        <div className="empty-habits">
          <div className="empty-state-graphic">
            <i className="fas fa-seedling"></i>
          </div>
          <h3>No habits tracked yet</h3>
          <p>Start your sustainability journey by adding your first eco-friendly habit</p>
          <button onClick={() => navigate('/habits/new')} className="btn btn-primary">
            <i className="fas fa-plus"></i> Add Your First Habit
          </button>
        </div>
      )}

      {!loading && habits.length > 0 && (
        <div className="habits-list">
          {filterByCategory().map((habit, index) => (
            <div key={habit._id || `habit-${index}-${habit.date}`} className="habit-card">
              <div className="habit-card-header">
                <div className={`habit-category ${getCategoryClass(habit.category)}`}>
                  {habit.category}
                </div>
                <div className="habit-date">{formatDate(habit.date)}</div>
              </div>

              <div className="habit-card-body">
                <p className="habit-description">{habit.description}</p>
                <div className="habit-impact">
                  <i className="fas fa-leaf"></i>
                  <span>Impact: {habit.carbonFootprint} kg CO₂ saved</span>
                </div>
              </div>

              <div className="habit-card-footer">
                <div className={`habit-status ${habit.isCompleted ? 'completed' : ''}`}>
                  {habit.isCompleted ? (
                    <i className="fas fa-check-circle"></i>
                  ) : (
                    <i className="far fa-circle"></i>
                  )}
                  {habit.isCompleted ? 'Completed' : 'Not completed'}
                </div>

                <div className="habit-actions">
                  {!habit.isCompleted && (
                    <button
                      onClick={() => completeHabit(habit)}
                      className="btn btn-sm btn-success"
                    >
                      Complete
                    </button>
                  )}
                  {habit._id && (
                    <>
                      <button
                        onClick={() => navigate(`/habits/edit/${habit._id}`)}
                        className="btn btn-sm btn-outline-secondary"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => deleteHabit(habit._id!)}
                        className="btn btn-sm btn-outline-danger"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HabitsList;

