import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Header from './components/Header';
import PrivateRoute from './components/PrivateRoute';
import Usuarios from './modulos/Usuarios';

const App = () => (
  <Router>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Header />
            <Home />
          </PrivateRoute>
        }
      />
      <Route
        path="/usuarios/*"
        element={
          <PrivateRoute>
            <Header />
            <Usuarios />
          </PrivateRoute>
        }
      />
    </Routes>
  </Router>
);

export default App;