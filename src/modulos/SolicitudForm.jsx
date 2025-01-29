import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, message } from 'antd';
import axios from 'axios';

const SolicitudForm = ({ solicitud, onClose, estados }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [tecnicos, setTecnicos] = useState([]);

    useEffect(() => {
        if (solicitud) {
            form.setFieldsValue(solicitud);
        } else {
            form.resetFields();
            const estadoNuevo = estados.find((e) => e.descripcion === 'Nuevo');
            form.setFieldsValue({ estado_id: estadoNuevo ? estadoNuevo.id : null });
        }
    }, [solicitud, form, estados]);

    useEffect(() => {
        const fetchTecnicos = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/usuarios`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const tecnicosFiltrados = response.data.filter(user => user.tipo_usuario === 'Tecnico');
                setTecnicos(tecnicosFiltrados);
            } catch (error) {
                message.error('Error al cargar técnicos');
            }
        };
        fetchTecnicos();
    }, []);

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (solicitud) {
                await axios.put(
                    `${import.meta.env.VITE_BACKEND_URL}/solicitudes/${solicitud.solicitud_numero}`,
                    values,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                message.success('Solicitud actualizada exitosamente');
            } else {
                await axios.post(`${import.meta.env.VITE_BACKEND_URL}/solicitudes`, values, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                message.success('Solicitud creada exitosamente');
            }
            onClose();
        } catch (error) {
            console.error('Error al guardar:', error);
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
            <Form.Item
                label="Técnico"
                name="tecnico"
            >
                <Select placeholder="Seleccione un técnico (opcional)">
                    {tecnicos.map((tecnico) => (
                        <Select.Option
                            key={tecnico.correo_electronico}
                            value={tecnico.correo_electronico}
                        >
                            {tecnico.nombre} {tecnico.apellido}
                        </Select.Option>
                    ))}
                </Select>
            </Form.Item>
            <Form.Item
                label="Estado"
                name="estado_id"
                rules={[{ required: true, message: 'Por favor seleccione un estado' }]}
            >
                <Select placeholder="Seleccione un estado">
                    {estados.map((estado) => (
                        <Select.Option key={estado.id} value={estado.id}>
                            {estado.descripcion}
                        </Select.Option>
                    ))}
                </Select>
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
                {solicitud ? 'Actualizar' : 'Crear'}
            </Button>
        </Form>
    );
};

export default SolicitudForm;