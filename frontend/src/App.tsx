import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Chat from './components/Chat';
import HabitsList from './components/HabitsList';
import HabitForm from './components/HabitForm';
import FootprintCalculator from './components/FootprintCalculator';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <div className="container">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chat"
                element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/habits"
                element={
                  <ProtectedRoute>
                    <HabitsList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/habits/new"
                element={
                  <ProtectedRoute>
                    <HabitForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/habits/edit/:id"
                element={
                  <ProtectedRoute>
                    <HabitForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/calculator"
                element={
                  <ProtectedRoute>
                    <FootprintCalculator />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

