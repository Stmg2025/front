import React, { useEffect, useState } from 'react';
import { Card, Button, Descriptions, Spin, Input, Select, message, Space } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { DownloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import { generateSolicitudPDF } from './PdfGenerator';

const SolicitudDetalle = () => {
    const { solicitudNumero } = useParams();
    const navigate = useNavigate();
    const [solicitud, setSolicitud] = useState(null);
    const [loading, setLoading] = useState(false);
    const [tecnicos, setTecnicos] = useState([]);
    const [estados, setEstados] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [direcciones, setDirecciones] = useState([]);
    const [contactos, setContactos] = useState([]);
    const [editingField, setEditingField] = useState(null);
    const [editedValue, setEditedValue] = useState('');

    const fetchSolicitudDetalle = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const [
                solicitudResponse,
                usuariosResponse,
                estadosResponse,
                clientesResponse
            ] = await Promise.all([
                axios.get(`${import.meta.env.VITE_BACKEND_URL}/solicitudes/${solicitudNumero}`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${import.meta.env.VITE_BACKEND_URL}/usuarios`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${import.meta.env.VITE_BACKEND_URL}/estado_tipos`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${import.meta.env.VITE_BACKEND_URL}/clientes`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            setSolicitud(solicitudResponse.data);
            setTecnicos(usuariosResponse.data.filter(usuario => usuario.tipo_usuario === 'Tecnico'));
            setEstados(estadosResponse.data);
            setClientes(clientesResponse.data);

            if (solicitudResponse.data.cliente_codigo) {
                const [direccionesRes, contactosRes] = await Promise.all([
                    axios.get(
                        `${import.meta.env.VITE_BACKEND_URL}/direcciones/cliente/${solicitudResponse.data.cliente_codigo}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    ),
                    axios.get(
                        `${import.meta.env.VITE_BACKEND_URL}/contactos/cliente/${solicitudResponse.data.cliente_codigo}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    )
                ]);
                setDirecciones(direccionesRes.data);
                setContactos(contactosRes.data);
            }
        } catch (error) {
            console.error('Error al cargar datos:', error);
            message.error('Error al cargar los datos de la solicitud.');
        } finally {
            setLoading(false);
        }
    };

    const handleClienteChange = async (clienteCodigo) => {
        try {
            const token = localStorage.getItem('token');
            const [direccionesRes, contactosRes] = await Promise.all([
                axios.get(
                    `${import.meta.env.VITE_BACKEND_URL}/direcciones/cliente/${clienteCodigo}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                ),
                axios.get(
                    `${import.meta.env.VITE_BACKEND_URL}/contactos/cliente/${clienteCodigo}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                )
            ]);
            setDirecciones(direccionesRes.data);
            setContactos(contactosRes.data);
            setEditedValue(clienteCodigo);
        } catch (error) {
            message.error('Error al cargar datos del cliente');
        }
    };

    const getEstadoDescripcion = (estado_id) => {
        const estado = estados.find(e => e.id === estado_id);
        return estado ? estado.descripcion : 'Desconocido';
    };

    const getTecnicoNombre = (correo_electronico) => {
        const tecnico = tecnicos.find(t => t.correo_electronico === correo_electronico);
        return tecnico ? `${tecnico.nombre} ${tecnico.apellido}` : 'No asignado';
    };

    const getClienteNombre = (codigo) => {
        const cliente = clientes.find(c => c.codigo === codigo);
        return cliente ? cliente.nombre : 'No asignado';
    };

    const getDireccionDescripcion = (id) => {
        const direccion = direcciones.find(d => d.id === id);
        return direccion ?
            `${direccion.direccion} ${direccion.numero || ''}, ${direccion.comuna}` :
            'No asignada';
    };

    const getContactoNombre = (id) => {
        const contacto = contactos.find(c => c.id === id);
        return contacto ?
            `${contacto.nombre} ${contacto.apellido || ''} - ${contacto.cargo || 'Sin cargo'}` :
            'No asignado';
    };
    const formatFechaHora = (fecha) => {
        if (!fecha) return 'No especificada';
        const date = new Date(fecha);
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    };

    const handleEdit = (field, currentValue) => {
        setEditingField(field);
        setEditedValue(currentValue);

        // Si estamos editando el cliente, limpiar direcciones y contactos
        if (field === 'cliente_codigo') {
            setDirecciones([]);
            setContactos([]);
        }
    };

    const handleSave = async (field) => {
        try {
            const token = localStorage.getItem('token');

            // Si estamos cambiando el cliente, limpiar dirección y contacto
            let dataToUpdate = { [field]: editedValue };
            if (field === 'cliente_codigo') {
                dataToUpdate = {
                    ...dataToUpdate,
                    direccion_id: null,
                    contacto_id: null
                };
            }

            await axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/solicitudes/${solicitudNumero}`,
                dataToUpdate,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSolicitud(prev => ({ ...prev, ...dataToUpdate }));
            setEditingField(null);
            message.success('Campo actualizado con éxito');
            await fetchSolicitudDetalle();
        } catch (error) {
            console.error('Error al actualizar:', error);
            message.error('Error al actualizar el campo.');
        }
    };

    const handleCancel = () => {
        setEditingField(null);
        setEditedValue('');
    };

    const handleGeneratePDF = async () => {
        await generateSolicitudPDF({
            solicitudNumero,
            solicitud,
            getTecnicoNombre,
            getEstadoDescripcion,
            formatFechaHora,
            getClienteNombre,
            getDireccionDescripcion,
            getContactoNombre
        });
    };

    useEffect(() => {
        fetchSolicitudDetalle();
    }, [solicitudNumero]);

    return (
        <Spin spinning={loading}>
            {solicitud && (
                <div>
                    <Space style={{ marginBottom: 16, marginLeft: 20 }}>
                        <Button onClick={() => navigate('/solicitudes')}>Volver</Button>
                        <Button
                            type="primary"
                            icon={<DownloadOutlined />}
                            onClick={handleGeneratePDF}
                        >
                            Exportar PDF
                        </Button>
                    </Space>
                    <Card
                        title={`Detalle de Solicitud ${solicitud.solicitud_numero}`}
                        style={{ margin: '20px' }}
                    >
                        <Descriptions bordered column={1}>
                            <Descriptions.Item label="Número de Solicitud">
                                {solicitud.solicitud_numero}
                            </Descriptions.Item>

                            <Descriptions.Item label="Cliente">
                                {editingField === 'cliente_codigo' ? (
                                    <div>
                                        <Select
                                            style={{ width: '100%' }}
                                            value={editedValue}
                                            onChange={(value) => {
                                                handleClienteChange(value);
                                            }}
                                            showSearch
                                            optionFilterProp="children"
                                        >
                                            {clientes.map(cliente => (
                                                <Select.Option key={cliente.codigo} value={cliente.codigo}>
                                                    {cliente.nombre} - {cliente.rut}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                        <Button type="link" onClick={() => handleSave('cliente_codigo')}>Guardar</Button>
                                        <Button type="link" onClick={handleCancel}>Cancelar</Button>
                                    </div>
                                ) : (
                                    <div>
                                        {getClienteNombre(solicitud.cliente_codigo)}{' '}
                                        <Button type="link" onClick={() => handleEdit('cliente_codigo', solicitud.cliente_codigo)}>
                                            Editar
                                        </Button>
                                    </div>
                                )}
                            </Descriptions.Item>

                            <Descriptions.Item label="Dirección">
                                {editingField === 'direccion_id' ? (
                                    <div>
                                        <Select
                                            style={{ width: '100%' }}
                                            value={editedValue}
                                            onChange={(value) => setEditedValue(value)}
                                            disabled={!solicitud.cliente_codigo}
                                        >
                                            {direcciones.map(direccion => (
                                                <Select.Option key={direccion.id} value={direccion.id}>
                                                    {`${direccion.direccion} ${direccion.numero || ''}, ${direccion.comuna}`}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                        <Button type="link" onClick={() => handleSave('direccion_id')}>Guardar</Button>
                                        <Button type="link" onClick={handleCancel}>Cancelar</Button>
                                    </div>
                                ) : (
                                    <div>
                                        {getDireccionDescripcion(solicitud.direccion_id)}{' '}
                                        <Button
                                            type="link"
                                            onClick={() => handleEdit('direccion_id', solicitud.direccion_id)}
                                            disabled={!solicitud.cliente_codigo}
                                        >
                                            Editar
                                        </Button>
                                    </div>
                                )}
                            </Descriptions.Item>

                            <Descriptions.Item label="Contacto">
                                {editingField === 'contacto_id' ? (
                                    <div>
                                        <Select
                                            style={{ width: '100%' }}
                                            value={editedValue}
                                            onChange={(value) => setEditedValue(value)}
                                            disabled={!solicitud.cliente_codigo}
                                        >
                                            {contactos.map(contacto => (
                                                <Select.Option key={contacto.id} value={contacto.id}>
                                                    {`${contacto.nombre} ${contacto.apellido || ''} - ${contacto.cargo || 'Sin cargo'}`}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                        <Button type="link" onClick={() => handleSave('contacto_id')}>Guardar</Button>
                                        <Button type="link" onClick={handleCancel}>Cancelar</Button>
                                    </div>
                                ) : (
                                    <div>
                                        {getContactoNombre(solicitud.contacto_id)}{' '}
                                        <Button
                                            type="link"
                                            onClick={() => handleEdit('contacto_id', solicitud.contacto_id)}
                                            disabled={!solicitud.cliente_codigo}
                                        >
                                            Editar
                                        </Button>
                                    </div>
                                )}
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
                                                <Select.Option
                                                    key={tecnico.correo_electronico}
                                                    value={tecnico.correo_electronico}
                                                >
                                                    {`${tecnico.nombre} ${tecnico.apellido}`}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                        <Button type="link" onClick={() => handleSave('tecnico')}>Guardar</Button>
                                        <Button type="link" onClick={handleCancel}>Cancelar</Button>
                                    </div>
                                ) : (
                                    <div>
                                        {getTecnicoNombre(solicitud.tecnico)}{' '}
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
                </div>
            )}
        </Spin>
    );
};

export default SolicitudDetalle;