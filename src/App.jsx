import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CreateQuotation from './pages/CreateQuotation';
import EditQuotation from './pages/EditQuotation';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/create-quotation" element={<CreateQuotation />} />
        <Route path="/edit-quotation" element={<EditQuotation />} />
      </Routes>
    </Router>
  );
}

export default App;
