import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

// Lazy load pages for better performance
// This splits the code into separate bundles that are loaded only when needed
const LandingPage = React.lazy(() => import('./pages/public/LandingPage').then(module => ({ default: module.LandingPage })));
const AuthPage = React.lazy(() => import('./pages/public/AuthPage').then(module => ({ default: module.AuthPage })));
const BuyerDashboard = React.lazy(() => import('./pages/buyer/BuyerDashboard').then(module => ({ default: module.BuyerDashboard })));
const SellerDashboard = React.lazy(() => import('./pages/seller/SellerDashboard').then(module => ({ default: module.SellerDashboard })));
const ManufacturerProfile = React.lazy(() => import('./pages/public/ManufacturerProfile').then(module => ({ default: module.ManufacturerProfile })));

// Loading fallback component
const PageLoader = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    width: '100%',
    backgroundColor: 'var(--neutral-gray-50)'
  }}>
    <div className="animate-spin" style={{
      width: '40px',
      height: '40px',
      border: '3px solid #e5e7eb',
      borderTop: '3px solid var(--primary-teal)',
      borderRadius: '50%'
    }} />
  </div>
);

import { FirebaseConnectionCheck } from './components/FirebaseConnectionCheck';

function App() {
  return (
    <Router>
      <div className="app">
        <FirebaseConnectionCheck />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<AuthPage />} />
            <Route path="/buyer/*" element={<BuyerDashboard />} />
            <Route path="/seller/*" element={<SellerDashboard />} />
            <Route path="/manufacturer/:id" element={<ManufacturerProfile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;
