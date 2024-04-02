import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AddValor from './AddValor'; // Import your component for /add route
import Home from './Home'; // Import your component for home route

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add" element={<AddValor />} />
      </Routes>
    </Router>
  );
}

export default App;