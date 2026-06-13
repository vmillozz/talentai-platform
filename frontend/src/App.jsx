import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import JobBoard from './views/JobBoard';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        {/* Navbar */}
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link to="/" className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              TalentAI Platform
            </Link>
            <div className="flex gap-4 text-sm font-medium text-gray-600">
              <Link to="/" className="hover:text-indigo-600 transition-colors">Bacheca Lavori</Link>
              <span className="text-gray-300">|</span>
              <span className="text-gray-400 cursor-not-allowed">Dashboard Recruiter (Prossimamente)</span>
            </div>
          </div>
        </nav>

        {/* Contenuto Principale */}
        <main className="py-4">
          <Routes>
            <Route path="/" element={<JobBoard />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}