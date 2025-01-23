// Usuarios.jsx
import React, { useState, useEffect } from 'react';
import { Layout, Table, Button, Modal, Form, Input, message } from 'antd';
import { UserAddOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Content } = Layout;

const Usuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingUser, setEditingUser] = useState(null);

    const apiUrl = window.location.hostname === 'localhost'
        ? 'http://localhost:3001'
        : 'https://back-mu-ochre.vercel.app';

    const columns = [
        { title: 'Nombre', dataIndex: 'nombre', key: 'nombre' },
        { title: 'Apellido', dataIndex: 'apellido', key: 'apellido' },
        { title: 'Email', dataIndex: 'correo_electronico', key: 'correo_electronico' },
        { title: 'RUT', dataIndex: 'rut', key: 'rut' },
        { title: 'Ciudad', dataIndex: 'ciudad', key: 'ciudad' },
        { title: 'Comuna', dataIndex: 'comuna', key: 'comuna' },
        {
            title: 'Acciones',
            key: 'actions',
            render: (_, record) => (
                <>
                    <Button type="link" onClick={() => handleEdit(record)}>Editar</Button>
                    <Button type="link" danger onClick={() => handleDelete(record.id)}>Eliminar</Button>
                </>
            )
        }
    ];

    useEffect(() => {
        fetchUsuarios();
    }, []);

    const fetchUsuarios = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${apiUrl}/usuarios`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            console.log('Respuesta:', response.data);
            setUsuarios(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error completo:', error.response);
            message.error('Error al cargar usuarios');
        }
    };

    const handleSubmit = async (values) => {
        try {
            const token = localStorage.getItem('token');
            if (editingUser) {
                await axios.put(`${apiUrl}/usuarios/${editingUser.id}`, values, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                message.success('Usuario actualizado');
            } else {
                await axios.post(`${apiUrl}/usuarios/register`, values, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                message.success('Usuario creado');
            }
            setModalVisible(false);
            form.resetFields();
            fetchUsuarios();
            setEditingUser(null);
        } catch (error) {
            console.error('Error:', error);
            message.error('Error al procesar usuario');
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        form.setFieldsValue(user);
        setModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${apiUrl}/usuarios/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            message.success('Usuario eliminado');
            fetchUsuarios();
        } catch (error) {
            message.error('Error al eliminar usuario');
        }
    };

    return (
        <Layout>
            <Content style={{ padding: '24px' }}>
                <Button
                    type="primary"
                    icon={<UserAddOutlined />}
                    onClick={() => {
                        setEditingUser(null);
                        form.resetFields();
                        setModalVisible(true);
                    }}
                    style={{ marginBottom: 16 }}
                >
                    Nuevo Usuario
                </Button>

                <Table
                    columns={columns}
                    dataSource={usuarios || []}
                    rowKey="id"
                />

                <Modal
                    title={editingUser ? "Editar Usuario" : "Nuevo Usuario"}
                    open={modalVisible}
                    onCancel={() => setModalVisible(false)}
                    footer={null}
                >
                    <Form
                        form={form}
                        onFinish={handleSubmit}
                        layout="vertical"
                    >
                        <Form.Item name="nombre" label="Nombre" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="apellido" label="Apellido" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="correo_electronico" label="Email" rules={[{ required: true, type: 'email' }]}>
                            <Input />
                        </Form.Item>
                        {!editingUser && (
                            <Form.Item name="contrasena" label="Contraseña" rules={[{ required: !editingUser }]}>
                                <Input.Password />
                            </Form.Item>
                        )}
                        <Form.Item name="rut" label="RUT" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="ciudad" label="Ciudad">
                            <Input />
                        </Form.Item>
                        <Form.Item name="comuna" label="Comuna">
                            <Input />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit">
                                {editingUser ? 'Actualizar' : 'Crear'}
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>
            </Content>
        </Layout>
    );
};

export default Usuarios;