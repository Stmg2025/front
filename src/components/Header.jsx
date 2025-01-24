import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate } from 'react-router-dom';
import { HomeOutlined, UserOutlined, LogoutOutlined, FileTextOutlined } from '@ant-design/icons';
import logo from '../assets/logo.png'; // Importa el logo desde la carpeta assets

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
            key: 'solicitudes',
            icon: <FileTextOutlined />,
            label: 'Solicitudes',
            onClick: () => navigate('/solicitudes')
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Cerrar Sesión',
            onClick: handleLogout
        }
    ];

    return (
        <Header style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ marginRight: '16px' }}>
                <img
                    src={logo} // Usa el logo importado
                    alt="Logo"
                    style={{ height: '40px' }}
                />
            </div>
            <Menu
                theme="dark"
                mode="horizontal"
                items={menuItems}
                defaultSelectedKeys={['home']}
                style={{ flex: 1 }}
            />
        </Header>
    );
};

export default AppHeader;
