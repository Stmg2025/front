import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, requiredRole = null }) => {
    // Obtener token
    const token = localStorage.getItem('token');

    // Función para obtener datos del usuario
    const getUserData = () => {
        try {
            return JSON.parse(localStorage.getItem('user') || '{}');
        } catch (error) {
            console.error('Error al obtener datos del usuario:', error);
            return {};
        }
    };

    // Si no hay token, redirige al login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Solo verificar rol si se requiere rol de administrador
    if (requiredRole === 'Administrador') {
        const userData = getUserData();
        if (userData.tipo_usuario !== 'Administrador') {
            return <Navigate to="/" replace />;
        }
    }

    // Si todo está bien, renderiza el componente hijo
    return children;
};

export default PrivateRoute;