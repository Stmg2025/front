import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, message } from 'antd';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const EditarUsuario = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { id } = useParams();
    const apiUrl = `${import.meta.env.VITE_BACKEND_URL}/usuarios/${id}`;

    useEffect(() => {
        cargarUsuario();
    }, []);

    const cargarUsuario = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(apiUrl, {
                headers: { Authorization: `Bearer ${token}` },
            });
            form.setFieldsValue(response.data);
        } catch (error) {
            message.error('Error al cargar el usuario');
        }
    };

    const manejarEditar = async (values) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(apiUrl, values, {
                headers: { Authorization: `Bearer ${token}` },
            });
            message.success('Usuario actualizado exitosamente');
            navigate('/usuarios');
        } catch (error) {
            message.error('Error al actualizar el usuario');
        }
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={manejarEditar}
            style={{ maxWidth: '600px', margin: '0 auto' }}
        >
            <h1>Editar Usuario</h1>
            <Form.Item
                label="Nombre"
                name="nombre"
                rules={[{ required: true, message: 'Por favor ingrese el nombre' }]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                label="Apellido"
                name="apellido"
                rules={[{ required: true, message: 'Por favor ingrese el apellido' }]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                label="Rut"
                name="rut"
                rules={[{ required: true, message: 'Por favor ingrese el RUT' }]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                label="Correo Electrónico"
                name="correo_electronico"
                rules={[{ required: true, message: 'Por favor ingrese el correo electrónico' }]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                label="Tipo de Usuario"
                name="tipo_usuario"
                rules={[{ required: true, message: 'Por favor seleccione un tipo de usuario' }]}
            >
                <Select>
                    <Select.Option value="Administrador">Administrador</Select.Option>
                    <Select.Option value="Asistente Servicio Tecnico">Asistente Servicio Técnico</Select.Option>
                    <Select.Option value="Tecnico">Técnico</Select.Option>
                </Select>
            </Form.Item>
            <Form.Item label="Ciudad" name="ciudad">
                <Input />
            </Form.Item>
            <Form.Item label="Teléfono" name="telefono">
                <Input />
            </Form.Item>
            <Form.Item label="Dirección" name="direccion">
                <Input.TextArea />
            </Form.Item>
            <Form.Item label="Comuna" name="comuna">
                <Input />
            </Form.Item>
            <Form.Item label="Avatar URL" name="avatar_url">
                <Input />
            </Form.Item>
            <Button type="primary" htmlType="submit" block>
                Actualizar Usuario
            </Button>
        </Form>
    );
};

export default EditarUsuario;
