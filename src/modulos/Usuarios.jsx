import React, { useState, useEffect } from 'react';
import { Layout, Table, Button, message } from 'antd';
import { UserAddOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Content } = Layout;

const Usuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const apiUrl = `${import.meta.env.VITE_BACKEND_URL}/usuarios`;

    useEffect(() => {
        cargarUsuarios();
    }, []);

    const cargarUsuarios = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(apiUrl, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsuarios(response.data);
        } catch (error) {
            message.error('Error al cargar los usuarios');
        } finally {
            setLoading(false);
        }
    };

    const manejarEliminar = async (id) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${apiUrl}/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            message.success('Usuario eliminado exitosamente');
            setUsuarios((prevUsuarios) => prevUsuarios.filter((user) => user.id !== id));
        } catch (error) {
            message.error('Error al eliminar el usuario');
        } finally {
            setLoading(false);
        }
    };

    const columnas = [
        { title: 'Nombre', dataIndex: 'nombre', key: 'nombre' },
        { title: 'Apellido', dataIndex: 'apellido', key: 'apellido' },
        { title: 'Correo Electrónico', dataIndex: 'correo_electronico', key: 'correo_electronico' },
        { title: 'Tipo de Usuario', dataIndex: 'tipo_usuario', key: 'tipo_usuario' },
        { title: 'Estado', dataIndex: 'estado', key: 'estado' },
        { title: 'Ciudad', dataIndex: 'ciudad', key: 'ciudad' },
        { title: 'Teléfono', dataIndex: 'telefono', key: 'telefono' },
        { title: 'Comuna', dataIndex: 'comuna', key: 'comuna' },
        { title: 'Última Sesión', dataIndex: 'ultima_sesion', key: 'ultima_sesion' },
        {
            title: 'Acciones',
            key: 'acciones',
            render: (_, record) => (
                <>
                    <Button type="link" onClick={() => navigate(`/usuarios/editar/${record.id}`)}>
                        Editar
                    </Button>
                    <Button
                        type="link"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => manejarEliminar(record.id)}
                    >
                        Eliminar
                    </Button>
                </>
            ),
        },
    ];

    return (
        <Content style={{ padding: '20px' }}>
            <h1>Gestión de Usuarios</h1>
            <Button
                type="primary"
                icon={<UserAddOutlined />}
                onClick={() => navigate('/usuarios/crear')}
                style={{ marginBottom: '20px' }}
            >
                Crear Usuario
            </Button>
            <Table
                columns={columnas}
                dataSource={usuarios}
                rowKey="id"
                loading={loading}
            />
        </Content>
    );
};

export default Usuarios;
