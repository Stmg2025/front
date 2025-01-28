import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    HomeOutlined,
    UserOutlined,
    LogoutOutlined,
    FileTextOutlined,
    TeamOutlined
} from '@ant-design/icons';
import logo from '../assets/logo.png';

const { Header } = Layout;

const AppHeader = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const getUserData = () => {
        try {
            const userData = JSON.parse(localStorage.getItem('user') || '{}');
            console.log('Datos del usuario:', userData);
            return userData;
        } catch (error) {
            console.error('Error al parsear userData:', error);
            return {};
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const userData = getUserData();
    const isAdmin = userData.tipo_usuario === 'Administrador';

    const baseMenuItems = [
        {
            key: '/',
            icon: <HomeOutlined />,
            label: 'Inicio',
            onClick: () => navigate('/')
        },
        {
            key: '/solicitudes',
            icon: <FileTextOutlined />,
            label: 'Solicitudes',
            onClick: () => navigate('/solicitudes')
        },
        {
            key: '/clientes',
            icon: <TeamOutlined />,
            label: 'Clientes',
            onClick: () => navigate('/clientes')
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Cerrar Sesión',
            onClick: handleLogout
        }
    ];

    const adminMenuItem = {
        key: '/usuarios',
        icon: <UserOutlined />,
        label: 'Usuarios',
        onClick: () => navigate('/usuarios')
    };

    const menuItems = isAdmin ?
        [...baseMenuItems.slice(0, 1), adminMenuItem, ...baseMenuItems.slice(1)] :
        baseMenuItems;

    return (
        <Header style={{ display: 'flex', alignItems: 'center', padding: '0 24px' }}>
            <div style={{ marginRight: '16px' }}>
                <img
                    src={logo}
                    alt="Logo"
                    style={{ height: '40px' }}
                />
            </div>
            <Menu
                theme="dark"
                mode="horizontal"
                selectedKeys={[location.pathname]}
                items={menuItems}
                style={{
                    flex: 1,
                    minWidth: 0,
                    background: 'transparent',
                }}
                className="custom-menu"
            />
            <style>
                {`
                    .custom-menu.ant-menu-dark .ant-menu-item-selected {
                        background-color: #ff4d4f !important;
                    }
                    .custom-menu.ant-menu-dark .ant-menu-item:hover {
                        background-color: #ff7875 !important;
                    }
                    .custom-menu.ant-menu-dark .ant-menu-item-active {
                        background-color: #ff7875 !important;
                    }
                    .custom-menu.ant-menu-dark {
                        background: transparent;
                    }
                    .custom-menu.ant-menu-dark .ant-menu-submenu:hover {
                        background-color: #ff7875 !important;
                    }
                    .custom-menu.ant-menu-dark .ant-menu-submenu-selected {
                        background-color: #ff4d4f !important;
                    }
                    .ant-menu-dark .ant-menu-sub {
                        background: #001529 !important;
                    }
                `}
            </style>
        </Header>
    );
};

export default AppHeader;