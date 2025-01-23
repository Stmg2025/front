import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Header } = Layout;

const AppHeader = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token'); // Eliminar el token
        navigate('/login'); // Redirigir al login
    };

    return (
        <Header>
            <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['1']}>
                <Menu.Item key="1">Inicio</Menu.Item>
                <Menu.Item key="2" onClick={handleLogout}>
                    Cerrar Sesión
                </Menu.Item>
            </Menu>
        </Header>
    );
};

export default AppHeader;
