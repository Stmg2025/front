import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Modal, message, DatePicker, Space, AutoComplete } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SolicitudForm from './SolicitudForm';

const Solicitudes = () => {
    const [solicitudes, setSolicitudes] = useState([]);
    const [estados, setEstados] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSolicitud, setSelectedSolicitud] = useState(null);
    const [usuarios, setUsuarios] = useState({});
    const navigate = useNavigate();

    const fetchSolicitudes = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const [solicitudesResponse, usuariosResponse] = await Promise.all([
                axios.get(`${import.meta.env.VITE_BACKEND_URL}/solicitudes`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                axios.get(`${import.meta.env.VITE_BACKEND_URL}/usuarios`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
            ]);

            setSolicitudes(solicitudesResponse.data);

            // Crear un mapa de usuarios que incluya tanto el nombre completo como el correo
            const usuariosMap = {};
            usuariosResponse.data.forEach(usuario => {
                usuariosMap[usuario.correo_electronico] = {
                    nombreCompleto: `${usuario.nombre} ${usuario.apellido}`,
                    correo: usuario.correo_electronico
                };
            });
            setUsuarios(usuariosMap);
        } catch (error) {
            console.error('Error al cargar solicitudes:', error);
            message.error('Error al cargar solicitudes');
        } finally {
            setLoading(false);
        }
    };

    const fetchEstados = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/estado_tipos`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setEstados(response.data);
        } catch (error) {
            console.error('Error al cargar estados:', error);
            message.error('Error al cargar estados');
        }
    };

    const getEstadoDescripcion = (estado_id) => {
        const estado = estados.find((e) => e.id === estado_id);
        return estado ? estado.descripcion : 'Desconocido';
    };

    const getUniqueValues = (dataIndex) => {
        const values = new Set();
        solicitudes.forEach(item => {
            if (dataIndex === 'creado_por' || dataIndex === 'tecnico') {
                const usuario = usuarios[item[dataIndex]];
                values.add(usuario ? usuario.nombreCompleto : item[dataIndex]);
            } else if (dataIndex === 'estado_id') {
                values.add(getEstadoDescripcion(item[dataIndex]));
            } else {
                values.add(item[dataIndex]);
            }
        });
        return Array.from(values).filter(Boolean);
    };

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    const handleReset = (clearFilters) => {
        clearFilters();
        setSearchText('');
    };

    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
                <AutoComplete
                    options={getUniqueValues(dataIndex).map(value => ({ value: value?.toString() }))}
                    value={selectedKeys[0]}
                    onChange={value => setSelectedKeys(value ? [value] : [])}
                    onSelect={value => setSelectedKeys([value])}
                    style={{ width: 188, marginBottom: 8, display: 'block' }}
                >
                    <Input
                        placeholder={`Buscar ${dataIndex}`}
                        onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    />
                </AutoComplete>
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Buscar
                    </Button>
                    <Button
                        onClick={() => handleReset(clearFilters)}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Limpiar
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
        onFilter: (value, record) => {
            if (dataIndex === 'creado_por' || dataIndex === 'tecnico') {
                const usuario = usuarios[record[dataIndex]];
                const displayValue = usuario ? usuario.nombreCompleto : record[dataIndex];
                return displayValue.toString().toLowerCase().includes(value.toLowerCase());
            } else if (dataIndex === 'estado_id') {
                return getEstadoDescripcion(record[dataIndex]).toLowerCase().includes(value.toLowerCase());
            }
            return record[dataIndex]
                ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
                : '';
        },
    });

    const handleCreate = () => {
        setSelectedSolicitud(null);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        fetchSolicitudes();
    };

    const formatFecha = (fecha) => {
        const date = new Date(fecha);
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    };

    useEffect(() => {
        fetchSolicitudes();
        fetchEstados();
    }, []);

    const columns = [
        {
            title: 'Numero de OT',
            dataIndex: 'solicitud_numero',
            key: 'solicitud_numero',
            ...getColumnSearchProps('solicitud_numero'),
            sorter: (a, b) => a.solicitud_numero.localeCompare(b.solicitud_numero),
            render: (text, record) => (
                <Button type="link" onClick={() => navigate(`/solicitudes/${record.solicitud_numero}`)}>
                    {text}
                </Button>
            ),
        },
        {
            title: 'Detalles',
            dataIndex: 'detalles',
            key: 'detalles',
            ...getColumnSearchProps('detalles'),
            sorter: (a, b) => a.detalles.localeCompare(b.detalles),
        },
        {
            title: 'Fecha Creación',
            dataIndex: 'fecha_creacion',
            key: 'fecha_creacion',
            render: (fecha_creacion) => formatFecha(fecha_creacion),
            sorter: (a, b) => new Date(a.fecha_creacion) - new Date(b.fecha_creacion),
        },
        {
            title: 'Creado Por',
            dataIndex: 'creado_por',
            key: 'creado_por',
            ...getColumnSearchProps('creado_por'),
            render: (creado_por) => usuarios[creado_por]?.nombreCompleto || creado_por,
            sorter: (a, b) => {
                const nombreA = usuarios[a.creado_por]?.nombreCompleto || a.creado_por;
                const nombreB = usuarios[b.creado_por]?.nombreCompleto || b.creado_por;
                return nombreA.localeCompare(nombreB);
            },
        },
        {
            title: 'Técnico',
            dataIndex: 'tecnico',
            key: 'tecnico',
            ...getColumnSearchProps('tecnico'),
            render: (tecnico) => usuarios[tecnico]?.nombreCompleto || 'No asignado',
            sorter: (a, b) => {
                const nombreA = usuarios[a.tecnico]?.nombreCompleto || 'No asignado';
                const nombreB = usuarios[b.tecnico]?.nombreCompleto || 'No asignado';
                return nombreA.localeCompare(nombreB);
            },
        },
        {
            title: 'Estado',
            dataIndex: 'estado_id',
            key: 'estado_id',
            render: (estado_id) => getEstadoDescripcion(estado_id),
            filters: estados.map((estado) => ({
                text: estado.descripcion,
                value: estado.id,
            })),
            onFilter: (value, record) => record.estado_id === value,
            sorter: (a, b) => getEstadoDescripcion(a.estado_id).localeCompare(getEstadoDescripcion(b.estado_id)),
        },
    ];

    return (
        <div>
            <h1>Solicitudes</h1>
            <Button
                type="primary"
                onClick={handleCreate}
                style={{
                    marginBottom: 20,
                    backgroundColor: '#ff4d4f',
                    borderColor: '#ff4d4f'
                }}
                icon={<PlusOutlined />}
            >
                Crear Solicitud
            </Button>
            <Table
                dataSource={solicitudes}
                columns={columns}
                rowKey="solicitud_numero"
                loading={loading}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                }}
            />
            <Modal
                title={selectedSolicitud ? 'Editar Solicitud' : 'Crear Solicitud'}
                open={isModalOpen}
                footer={null}
                onCancel={() => setIsModalOpen(false)}
            >
                <SolicitudForm
                    solicitud={selectedSolicitud}
                    onClose={handleModalClose}
                    estados={estados}
                />
            </Modal>
        </div>
    );
};

export default Solicitudes;