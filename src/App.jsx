import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CreateQuotation from './pages/CreateQuotation';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/create-quotation" element={<CreateQuotation />} />
      </Routes>
    </Router>
  );
}

export default App;
