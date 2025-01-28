import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import axios from 'axios';

const ClienteForm = ({ cliente, onClose }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (cliente) {
            form.setFieldsValue(cliente);
        } else {
            form.resetFields();
        }
    }, [cliente, form]);

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (cliente) {
                await axios.put(
                    `${import.meta.env.VITE_BACKEND_URL}/clientes/${cliente.codigo}`,
                    values,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                message.success('Cliente actualizado exitosamente');
            } else {
                await axios.post(
                    `${import.meta.env.VITE_BACKEND_URL}/clientes`,
                    values,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                message.success('Cliente creado exitosamente');
            }
            onClose();
        } catch (error) {
            message.error('Error al guardar el cliente');
            console.error('Error al guardar el cliente:', error); // Agregar console.error para debugging
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form form={form} onFinish={handleSubmit} layout="vertical">
            {!cliente && (
                <Form.Item
                    label="Código"
                    name="codigo"
                    rules={[{ required: true, message: 'Por favor ingrese el código del cliente' }]}
                >
                    <Input />
                </Form.Item>
            )}
            <Form.Item
                label="Nombre"
                name="nombre"
                rules={[{ required: true, message: 'Por favor ingrese el nombre del cliente' }]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                label="RUT"
                name="rut"
                rules={[{ required: true, message: 'Por favor ingrese el RUT del cliente' }]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                label="Dirección"
                name="direccion"
            >
                <Input />
            </Form.Item>
            <Form.Item
                label="Número"
                name="numero"
            >
                <Input />
            </Form.Item>
            <Form.Item
                label="Teléfono"
                name="fono"
            >
                <Input />
            </Form.Item>
            <Form.Item
                label="Comuna"
                name="comuna"
            >
                <Input />
            </Form.Item>
            <Form.Item
                label="Ciudad"
                name="ciudad"
            >
                <Input />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
                {cliente ? 'Actualizar' : 'Crear'}
            </Button>
        </Form>
    );
};

export default ClienteForm;