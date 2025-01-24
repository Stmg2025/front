import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Header from './components/Header';
import PrivateRoute from './components/PrivateRoute';
import Usuarios from './modulos/Usuarios';
import CrearUsuario from './modulos/CrearUsuario';
import EditarUsuario from './modulos/EditarUsuario';
import Solicitudes from './modulos/Solicitudes';

const App = () => (
  <Router>
    <Routes>
      {/* Ruta para iniciar sesión */}
      <Route path="/login" element={<Login />} />

      {/* Rutas protegidas */}
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
        path="/usuarios"
        element={
          <PrivateRoute>
            <Header />
            <Usuarios />
          </PrivateRoute>
        }
      />
      <Route
        path="/usuarios/crear"
        element={
          <PrivateRoute>
            <Header />
            <CrearUsuario />
          </PrivateRoute>
        }
      />
      <Route
        path="/usuarios/editar/:id"
        element={
          <PrivateRoute>
            <Header />
            <EditarUsuario />
          </PrivateRoute>
        }
      />
      <Route
        path="/solicitudes"
        element={
          <PrivateRoute>
            <Header />
            <Solicitudes />
          </PrivateRoute>
        }
      />
    </Routes>
  </Router>
);

export default App;
