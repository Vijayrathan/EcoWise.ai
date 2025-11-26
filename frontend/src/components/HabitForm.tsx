import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { habitService } from '../services/habitService';
import { HabitCategory } from '../types/habit.model';
import './HabitForm.css';

const HabitForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<HabitCategory | ''>('');
  const [carbonFootprint, setCarbonFootprint] = useState(1);
  const [sustainableAlternative, setSustainableAlternative] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    description?: string;
    category?: string;
    carbonFootprint?: string;
  }>({});

  const categories: HabitCategory[] = ['transport', 'energy', 'diet', 'waste', 'water', 'other'];

  useEffect(() => {
    if (isEditMode && id) {
      loadHabitData(id);
    }
  }, [isEditMode, id]);

  const loadHabitData = async (habitId: string) => {
    setLoading(true);
    try {
      const habit = await habitService.getHabitById(habitId);
      setDescription(habit.description);
      setCategory(habit.category);
      setCarbonFootprint(habit.carbonFootprint);
      setSustainableAlternative(habit.sustainableAlternative || '');
    } catch (error) {
      console.error('Error loading habit:', error);
    } finally {
      setLoading(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!category) {
      newErrors.category = 'Category is required';
    }

    if (carbonFootprint < 0) {
      newErrors.carbonFootprint = 'Carbon footprint value must be positive';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    if (!user?._id) {
      console.error('No user logged in');
      navigate('/login');
      return;
    }

    setLoading(true);

    const habitData = {
      description,
      category: category as HabitCategory,
      carbonFootprint,
      sustainableAlternative,
      date: new Date(),
      isCompleted: false,
      pointsEarned: 0,
      userId: user._id,
    };

    try {
      if (isEditMode && id) {
        await habitService.updateHabit(id, habitData);
      } else {
        await habitService.createHabit(habitData);
      }
      navigate('/habits');
    } catch (error) {
      console.error('Error saving habit:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="habit-form-container">
        <div className="loading-container">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading habit data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="habit-form-container">
      <div className="habit-form-header">
        <h1>
          <i className="fas fa-leaf"></i>
          {isEditMode ? 'Edit Habit' : 'Add New Habit'}
        </h1>
        <p>{isEditMode ? 'Update your sustainable habit details' : 'Track a new eco-friendly habit'}</p>
      </div>

      <div className="habit-form-card">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="description" className="form-label">
              Habit Description
            </label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`form-control ${errors.description ? 'is-invalid' : ''}`}
              placeholder="Describe your sustainable habit"
            />
            {errors.description && <div className="invalid-feedback">{errors.description}</div>}
          </div>

          <div className="mb-3">
            <label htmlFor="category" className="form-label">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as HabitCategory)}
              className={`form-select ${errors.category ? 'is-invalid' : ''}`}
            >
              <option value="" disabled>
                Select a category
              </option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
            {errors.category && <div className="invalid-feedback">{errors.category}</div>}
          </div>

          <div className="mb-3">
            <label htmlFor="carbonFootprint" className="form-label">
              Carbon Footprint Reduction (kg CO₂)
            </label>
            <input
              type="number"
              id="carbonFootprint"
              value={carbonFootprint}
              onChange={(e) => setCarbonFootprint(parseFloat(e.target.value) || 0)}
              className={`form-control ${errors.carbonFootprint ? 'is-invalid' : ''}`}
              min="0"
              step="0.1"
            />
            {errors.carbonFootprint && (
              <div className="invalid-feedback">{errors.carbonFootprint}</div>
            )}
            <div className="form-text">Estimate the carbon footprint reduction from this habit</div>
          </div>

          <div className="mb-3">
            <label htmlFor="sustainableAlternative" className="form-label">
              Sustainable Alternative
            </label>
            <input
              type="text"
              id="sustainableAlternative"
              value={sustainableAlternative}
              onChange={(e) => setSustainableAlternative(e.target.value)}
              className="form-control"
              placeholder="Describe a sustainable alternative (optional)"
            />
          </div>

          <div className="habit-form-actions">
            <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/habits')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {isEditMode ? 'Update Habit' : 'Save Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HabitForm;

