import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Register } from './pages/Register';
import { AuthCallback } from './pages/AuthCallback';
import { Layout } from './components/Layout';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Register />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;