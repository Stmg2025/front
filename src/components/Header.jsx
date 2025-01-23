import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate } from 'react-router-dom';
import { HomeOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';

const { Header } = Layout;

const AppHeader = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const menuItems = [
        {
            key: 'home',
            icon: <HomeOutlined />,
            label: 'Inicio',
            onClick: () => navigate('/')
        },
        {
            key: 'usuarios',
            icon: <UserOutlined />,
            label: 'Usuarios',
            onClick: () => navigate('/usuarios')
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Cerrar Sesión',
            onClick: handleLogout
        }
    ];

    return (
        <Header>
            <Menu
                theme="dark"
                mode="horizontal"
                items={menuItems}
                defaultSelectedKeys={['home']}
            />
        </Header>
    );
};

export default AppHeader;