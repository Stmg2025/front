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
import SolicitudDetalle from './modulos/SolicitudDetalle'; // Importamos el nuevo componente
import Clientes from './modulos/Clientes';
import DireccionesCliente from './modulos/DireccionesCliente';
import ContactosCliente from './modulos/ContactosCliente';

const App = () => (
  <Router>
    <Routes>
      {/* Ruta pública para login */}
      <Route path="/login" element={<Login />} />

      {/* Ruta principal protegida */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Header />
            <Home />
          </PrivateRoute>
        }
      />

      {/* Rutas protegidas para administración de usuarios */}
      <Route
        path="/usuarios"
        element={
          <PrivateRoute requiredRole="Administrador">
            <Header />
            <Usuarios />
          </PrivateRoute>
        }
      />
      <Route
        path="/usuarios/crear"
        element={
          <PrivateRoute requiredRole="Administrador">
            <Header />
            <CrearUsuario />
          </PrivateRoute>
        }
      />
      <Route
        path="/usuarios/editar/:id"
        element={
          <PrivateRoute requiredRole="Administrador">
            <Header />
            <EditarUsuario />
          </PrivateRoute>
        }
      />

      {/* Ruta protegida para solicitudes - accesible para todos los usuarios autenticados */}
      <Route
        path="/solicitudes"
        element={
          <PrivateRoute>
            <Header />
            <Solicitudes />
          </PrivateRoute>
        }
      />
      {/* Ruta protegida para el detalle de una solicitud */}
      <Route
        path="/solicitudes/:solicitudNumero"
        element={
          <PrivateRoute>
            <Header />
            <SolicitudDetalle />
          </PrivateRoute>
        }
      />

      {/* Rutas protegidas para clientes, direcciones y contactos */}
      <Route
        path="/clientes"
        element={
          <PrivateRoute>
            <Header />
            <Clientes />
          </PrivateRoute>
        }
      />
      <Route
        path="/clientes/:codigo/direcciones"
        element={
          <PrivateRoute>
            <Header />
            <DireccionesCliente />
          </PrivateRoute>
        }
      />
      <Route
        path="/clientes/:codigo/contactos"
        element={
          <PrivateRoute>
            <Header />
            <ContactosCliente />
          </PrivateRoute>
        }
      />
    </Routes>
  </Router>
);

export default App;
