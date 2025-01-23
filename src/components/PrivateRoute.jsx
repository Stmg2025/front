import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');

    // Si no hay token, redirige al login
    return token ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
