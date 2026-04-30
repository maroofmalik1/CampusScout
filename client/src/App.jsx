import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CompareProvider } from './context/CompareContext';
import Navbar from './components/Navbar';
import CompareBar from './components/CompareBar';
import Home from './pages/Home';
import CollegeDetail from './pages/CollegeDetail';
import Compare from './pages/Compare';
import Predictor from './pages/Predictor';
import Login from './pages/Login';
import Register from './pages/Register';
import Saved from './pages/Saved';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CompareProvider>
          <Navbar />
          <Routes>
            <Route path="/"            element={<Home />} />
            <Route path="/colleges/:id" element={<CollegeDetail />} />
            <Route path="/compare"      element={<Compare />} />
            <Route path="/predictor"    element={<Predictor />} />
            <Route path="/login"        element={<Login />} />
            <Route path="/register"     element={<Register />} />
            <Route path="/saved"        element={<Saved />} />
          </Routes>
          <CompareBar />
        </CompareProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}