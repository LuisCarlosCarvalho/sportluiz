import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Plans from './pages/Plans';
import Callups from './pages/Callups';
import Stats from './pages/Stats';
import Scoreboard from './pages/Scoreboard';
import TacticalBoard from './pages/TacticalBoard';
import Planning from './pages/Planning';
import VideoAnalysis from './pages/VideoAnalysis';
import Competitions from './pages/Competitions';
import AthleteJournal from './pages/AthleteJournal';
import Sidebar from './components/Sidebar';

// Simple Route wrapper to enforce authentication
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Layout wrapper for all protected routes containing the Sidebar
const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-black text-neutral-100 flex flex-row font-sans">
      <Sidebar />
      <main className="flex-1 min-w-0 h-screen overflow-y-auto custom-scrollbar bg-black">
        {children}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes inside layout */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/callups" 
          element={
            <ProtectedRoute>
              <AppLayout>
                <Callups />
              </AppLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/stats" 
          element={
            <ProtectedRoute>
              <AppLayout>
                <Stats />
              </AppLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/scoreboard" 
          element={
            <ProtectedRoute>
              <AppLayout>
                <Scoreboard />
              </AppLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/tactical-board" 
          element={
            <ProtectedRoute>
              <AppLayout>
                <TacticalBoard />
              </AppLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/planning" 
          element={
            <ProtectedRoute>
              <AppLayout>
                <Planning />
              </AppLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/video-analysis" 
          element={
            <ProtectedRoute>
              <AppLayout>
                <VideoAnalysis />
              </AppLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/competitions" 
          element={
            <ProtectedRoute>
              <AppLayout>
                <Competitions />
              </AppLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/athlete-journal" 
          element={
            <ProtectedRoute>
              <AppLayout>
                <AthleteJournal />
              </AppLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/plans" 
          element={
            <ProtectedRoute>
              <AppLayout>
                <Plans />
              </AppLayout>
            </ProtectedRoute>
          } 
        />

        {/* Default redirect based on current credentials state */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Fallback wildcard route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
