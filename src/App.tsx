import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import SchoolsPage from './pages/SchoolsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="schools" element={<SchoolsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
