import React, { useEffect, useState } from 'react';
import { Card, Button, Descriptions, Spin, Input, Select, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const SolicitudDetalle = () => {
    const { solicitudNumero } = useParams();
    const navigate = useNavigate();
    const [solicitud, setSolicitud] = useState(null);
    const [loading, setLoading] = useState(false);
    const [tecnicos, setTecnicos] = useState([]);
    const [estados, setEstados] = useState([]);
    const [editingField, setEditingField] = useState(null);
    const [editedValue, setEditedValue] = useState('');

    const fetchSolicitudDetalle = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const solicitudResponse = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/solicitudes/${solicitudNumero}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSolicitud(solicitudResponse.data);

            const usuariosResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/usuarios`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTecnicos(usuariosResponse.data.filter(usuario => usuario.tipo_usuario === 'Tecnico'));

            const estadosResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/estado_tipos`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setEstados(estadosResponse.data);
        } catch (error) {
            message.error('Error al cargar los datos de la solicitud.');
        } finally {
            setLoading(false);
        }
    };

    const getEstadoDescripcion = (estado_id) => {
        const estado = estados.find(e => e.id === estado_id);
        return estado ? estado.descripcion : 'Desconocido';
    };

    const formatFechaHora = (fecha) => {
        const date = new Date(fecha);
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    };

    const handleEdit = (field, currentValue) => {
        setEditingField(field);
        setEditedValue(currentValue);
    };

    const handleSave = async (field) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/solicitudes/${solicitudNumero}`,
                { [field]: editedValue },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSolicitud(prev => ({ ...prev, [field]: editedValue }));
            setEditingField(null);
            message.success('Campo actualizado con éxito');
        } catch (error) {
            message.error('Error al actualizar el campo.');
        }
    };

    const handleCancel = () => {
        setEditingField(null);
        setEditedValue('');
    };

    useEffect(() => {
        fetchSolicitudDetalle();
    }, [solicitudNumero]);

    return (
        <Spin spinning={loading}>
            {solicitud && (
                <Card
                    title={`Detalle de Solicitud ${solicitud.solicitud_numero}`}
                    extra={<Button onClick={() => navigate('/solicitudes')}>Volver</Button>}
                    style={{ margin: '20px' }}
                >
                    <Descriptions bordered column={1}>
                        <Descriptions.Item label="Número de Solicitud">
                            {solicitud.solicitud_numero}
                        </Descriptions.Item>
                        <Descriptions.Item label="Detalles">
                            {editingField === 'detalles' ? (
                                <div>
                                    <Input.TextArea
                                        value={editedValue}
                                        onChange={(e) => setEditedValue(e.target.value)}
                                        rows={3}
                                    />
                                    <Button type="link" onClick={() => handleSave('detalles')}>Guardar</Button>
                                    <Button type="link" onClick={handleCancel}>Cancelar</Button>
                                </div>
                            ) : (
                                <div>
                                    {solicitud.detalles || 'No especificado'}{' '}
                                    <Button type="link" onClick={() => handleEdit('detalles', solicitud.detalles)}>
                                        Editar
                                    </Button>
                                </div>
                            )}
                        </Descriptions.Item>
                        <Descriptions.Item label="Fecha y Hora de Creación">
                            {formatFechaHora(solicitud.fecha_creacion)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Creado Por">
                            {solicitud.creado_por || 'Desconocido'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Técnico Asignado">
                            {editingField === 'tecnico' ? (
                                <div>
                                    <Select
                                        style={{ width: '100%' }}
                                        value={editedValue}
                                        onChange={(value) => setEditedValue(value)}
                                    >
                                        {tecnicos.map(tecnico => (
                                            <Select.Option key={tecnico.correo_electronico} value={tecnico.correo_electronico}>
                                                {`${tecnico.nombre} ${tecnico.apellido}`}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                    <Button type="link" onClick={() => handleSave('tecnico')}>Guardar</Button>
                                    <Button type="link" onClick={handleCancel}>Cancelar</Button>
                                </div>
                            ) : (
                                <div>
                                    {tecnicos.find(tec => tec.correo_electronico === solicitud.tecnico)?.nombre || 'No asignado'}{' '}
                                    <Button type="link" onClick={() => handleEdit('tecnico', solicitud.tecnico)}>
                                        Editar
                                    </Button>
                                </div>
                            )}
                        </Descriptions.Item>
                        <Descriptions.Item label="Estado">
                            {editingField === 'estado_id' ? (
                                <div>
                                    <Select
                                        style={{ width: '100%' }}
                                        value={editedValue}
                                        onChange={(value) => setEditedValue(value)}
                                    >
                                        {estados.map(estado => (
                                            <Select.Option key={estado.id} value={estado.id}>
                                                {estado.descripcion}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                    <Button type="link" onClick={() => handleSave('estado_id')}>Guardar</Button>
                                    <Button type="link" onClick={handleCancel}>Cancelar</Button>
                                </div>
                            ) : (
                                <div>
                                    {getEstadoDescripcion(solicitud.estado_id)}{' '}
                                    <Button type="link" onClick={() => handleEdit('estado_id', solicitud.estado_id)}>
                                        Editar
                                    </Button>
                                </div>
                            )}
                        </Descriptions.Item>
                    </Descriptions>
                </Card>
            )}
        </Spin>
    );
};

export default SolicitudDetalle;
