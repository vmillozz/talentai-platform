import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import JobBoard from './views/JobBoard';
import DashboardRecruiter from './views/DashboardRecruiter';

// Componente helper per gestire lo stato attivo dei link della Navbar
function NavLink({ to, children }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link 
      to={to} 
      className={`transition-colors ${isActive ? 'text-indigo-600 font-semibold' : 'text-gray-600 hover:text-indigo-600'}`}
    >
      {children}
    </Link>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        {/* Navbar */}
        <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link to="/" className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent tracking-tight">
              TalentAI Platform
            </Link>
            <div className="flex gap-6 text-sm font-medium">
              <NavLink to="/">Bacheca Lavori</NavLink>
              <span className="text-gray-300">|</span>
              <NavLink to="/recruiter">Dashboard Recruiter</NavLink>
            </div>
          </div>
        </nav>

        {/* Contenuto Principale */}
        <main className="py-4">
          <Routes>
            <Route path="/" element={<JobBoard />} />
            <Route path="/recruiter" element={<DashboardRecruiter />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}