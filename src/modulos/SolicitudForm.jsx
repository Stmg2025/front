import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import axios from 'axios';

const SolicitudForm = ({ solicitud, onClose }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (solicitud) {
            form.setFieldsValue(solicitud);
        } else {
            form.resetFields();
        }
    }, [solicitud, form]);

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (solicitud) {
                // Editar solicitud existente
                await axios.put(
                    `${import.meta.env.VITE_BACKEND_URL}/solicitudes/${solicitud.solicitud_numero}`,
                    values,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                message.success('Solicitud actualizada exitosamente');
            } else {
                // Crear nueva solicitud
                await axios.post(`${import.meta.env.VITE_BACKEND_URL}/solicitudes`, values, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                message.success('Solicitud creada exitosamente');
            }
            onClose();
        } catch (error) {
            message.error('Error al guardar la solicitud');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form form={form} onFinish={handleSubmit} layout="vertical">
            <Form.Item
                label="Detalles"
                name="detalles"
                rules={[{ required: true, message: 'Por favor ingrese los detalles de la solicitud' }]}
            >
                <Input.TextArea rows={4} />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
                {solicitud ? 'Actualizar' : 'Crear'}
            </Button>
        </Form>
    );
};

export default SolicitudForm;
