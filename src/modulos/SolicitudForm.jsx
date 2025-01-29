// SolicitudForm.jsx
import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, message } from 'antd';
import axios from 'axios';

const SolicitudForm = ({ solicitud, onClose, estados }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [tecnicos, setTecnicos] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [direcciones, setDirecciones] = useState([]);
    const [contactos, setContactos] = useState([]);
    const [selectedCliente, setSelectedCliente] = useState(null);
    const [clientesSearch, setClientesSearch] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const [tecnicosRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_BACKEND_URL}/usuarios`, {
                        headers: { Authorization: `Bearer ${token}` },
                    })
                ]);

                setTecnicos(tecnicosRes.data.filter(user => user.tipo_usuario === 'Tecnico'));

                if (solicitud?.cliente_codigo) {
                    await fetchClienteData(solicitud.cliente_codigo);
                }
            } catch (error) {
                message.error('Error al cargar datos');
            }
        };
        fetchData();
    }, [solicitud]);

    const fetchClienteData = async (clienteCodigo) => {
        try {
            const token = localStorage.getItem('token');
            const [direccionesRes, contactosRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_BACKEND_URL}/direcciones/cliente/${clienteCodigo}`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                axios.get(`${import.meta.env.VITE_BACKEND_URL}/contactos/cliente/${clienteCodigo}`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
            ]);
            setDirecciones(direccionesRes.data);
            setContactos(contactosRes.data);
            setSelectedCliente(clienteCodigo);
        } catch (error) {
            message.error('Error al cargar datos del cliente');
        }
    };

    const handleClienteChange = async (clienteCodigo) => {
        form.setFieldsValue({
            direccion_id: null,
            contacto_id: null
        });
        await fetchClienteData(clienteCodigo);
    };

    const handleSearchClientes = async (value) => {
        if (!value) return;

        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/clientes`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { search: value, limit: 10 },
            });
            setClientesSearch(response.data);
        } catch (error) {
            message.error('Error al buscar clientes');
        }
    };

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (solicitud) {
                await axios.put(
                    `${import.meta.env.VITE_BACKEND_URL}/solicitudes/${solicitud.solicitud_numero}`,
                    values,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                message.success('Solicitud actualizada exitosamente');
            } else {
                await axios.post(
                    `${import.meta.env.VITE_BACKEND_URL}/solicitudes`,
                    values,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
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
                label="Cliente"
                name="cliente_codigo"
                rules={[{ required: true, message: 'Por favor seleccione un cliente' }]}
            >
                <Select
                    placeholder="Seleccione un cliente"
                    onSearch={handleSearchClientes}
                    onChange={handleClienteChange}
                    showSearch
                    filterOption={false}
                >
                    {clientesSearch.map(cliente => (
                        <Select.Option key={cliente.codigo} value={cliente.codigo}>
                            {cliente.nombre} - {cliente.rut}
                        </Select.Option>
                    ))}
                </Select>
            </Form.Item>

            <Form.Item
                label="Dirección"
                name="direccion_id"
                rules={[{ required: true, message: 'Por favor seleccione una dirección' }]}
            >
                <Select
                    placeholder="Seleccione una dirección"
                    disabled={!selectedCliente}
                >
                    {direcciones.map(direccion => (
                        <Select.Option key={direccion.id} value={direccion.id}>
                            {direccion.direccion_completa || `${direccion.direccion} ${direccion.numero || ''}`}
                        </Select.Option>
                    ))}
                </Select>
            </Form.Item>

            <Form.Item
                label="Contacto"
                name="contacto_id"
                rules={[{ required: true, message: 'Por favor seleccione un contacto' }]}
            >
                <Select
                    placeholder="Seleccione un contacto"
                    disabled={!selectedCliente}
                >
                    {contactos.map(contacto => (
                        <Select.Option key={contacto.id} value={contacto.id}>
                            {`${contacto.nombre} ${contacto.apellido || ''} - ${contacto.cargo || 'Sin cargo'}`}
                        </Select.Option>
                    ))}
                </Select>
            </Form.Item>

            <Form.Item
                label="Detalles"
                name="detalles"
                rules={[{ required: true, message: 'Por favor ingrese los detalles' }]}
            >
                <Input.TextArea rows={4} />
            </Form.Item>

            <Form.Item label="Técnico" name="tecnico">
                <Select placeholder="Seleccione un técnico (opcional)">
                    {tecnicos.map(tecnico => (
                        <Select.Option key={tecnico.correo_electronico} value={tecnico.correo_electronico}>
                            {`${tecnico.nombre} ${tecnico.apellido}`}
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
                    {estados.map(estado => (
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
