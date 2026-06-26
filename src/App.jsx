import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CreateQuotation from './pages/CreateQuotation';
import PreviewQuotation from './pages/PreviewQuotation';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/create-quotation" element={<CreateQuotation />} />
        <Route path="/preview" element={<PreviewQuotation />} />
      </Routes>
    </Router>
  );
}

export default App;
