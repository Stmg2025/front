import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Modal, message, DatePicker, Space, AutoComplete } from 'antd';
import { EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
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

    const fetchSolicitudes = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/solicitudes`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSolicitudes(response.data);

            const usuariosResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/usuarios`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const usuariosMap = {};
            usuariosResponse.data.forEach(usuario => {
                usuariosMap[usuario.correo_electronico] = `${usuario.nombre} ${usuario.apellido}`;
            });
            setUsuarios(usuariosMap);
        } catch (error) {
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
            if (dataIndex === 'creado_por') {
                values.add(usuarios[item[dataIndex]] || item[dataIndex]);
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
            if (dataIndex === 'creado_por') {
                return (usuarios[record[dataIndex]] || '').toString().toLowerCase().includes(value.toLowerCase());
            } else if (dataIndex === 'estado_id') {
                return getEstadoDescripcion(record[dataIndex]).toLowerCase().includes(value.toLowerCase());
            }
            return record[dataIndex]
                ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
                : '';
        },
        render: text => {
            if (dataIndex === 'creado_por') {
                return usuarios[text] || text;
            } else if (dataIndex === 'estado_id') {
                return getEstadoDescripcion(text);
            }
            return text;
        },
    });

    const handleCreate = () => {
        setSelectedSolicitud(null);
        setIsModalOpen(true);
    };

    const handleEdit = (record) => {
        setSelectedSolicitud(record);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        fetchSolicitudes();
    };

    useEffect(() => {
        fetchSolicitudes();
        fetchEstados();
    }, []);

    const formatFecha = (fecha) => {
        const date = new Date(fecha);
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    };

    const columns = [
        {
            title: 'Numero de OT',
            dataIndex: 'solicitud_numero',
            key: 'solicitud_numero',
            ...getColumnSearchProps('solicitud_numero'),
            sorter: (a, b) => a.solicitud_numero.localeCompare(b.solicitud_numero),
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
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    <DatePicker
                        value={selectedKeys[0]}
                        onChange={(date) => setSelectedKeys(date ? [date] : [])}
                        format="DD/MM/YYYY"
                        style={{ width: 188, marginBottom: 8, display: 'block' }}
                    />
                    <Space>
                        <Button
                            type="primary"
                            onClick={() => confirm()}
                            size="small"
                            style={{ width: 90 }}
                        >
                            Filtrar
                        </Button>
                        <Button
                            onClick={clearFilters}
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
                if (!record.fecha_creacion || !value) return false;
                const recordDate = new Date(record.fecha_creacion);
                const filterDate = new Date(value);
                return recordDate.toDateString() === filterDate.toDateString();
            },
        },
        {
            title: 'Creado Por',
            dataIndex: 'creado_por',
            key: 'creado_por',
            ...getColumnSearchProps('creado_por'),
            sorter: (a, b) => (usuarios[a.creado_por] || '').localeCompare(usuarios[b.creado_por] || ''),
        },
        {
            title: 'Técnico',
            dataIndex: 'tecnico',
            key: 'tecnico',
            ...getColumnSearchProps('tecnico'),
            sorter: (a, b) => (a.tecnico || '').localeCompare(b.tecnico || ''),
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
        {
            title: 'Acciones',
            key: 'acciones',
            render: (text, record) => (
                <Button
                    type="text"
                    icon={<EditOutlined style={{ fontSize: '16px', color: '#666' }} />}
                    onClick={() => handleEdit(record)}
                />
            ),
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