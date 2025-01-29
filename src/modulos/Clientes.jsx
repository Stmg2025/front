import React, { useEffect, useState, useCallback } from 'react';
import {
    Table,
    Button,
    Input,
    Modal,
    message,
    Space,
    Card,
    Select,
    Tooltip,
    Typography,
    Alert,
    Breadcrumb
} from 'antd';
import {
    EditOutlined,
    PlusOutlined,
    SearchOutlined,
    EnvironmentOutlined,
    ReloadOutlined,
    HomeOutlined,
    UserOutlined,
    CloseCircleOutlined,
    PhoneOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ClienteForm from './ClienteForm';
import { debounce } from 'lodash';

const { Option } = Select;
const { Text } = Typography;
const { Search } = Input;

const PAGE_SIZES = [10, 20, 50, 100, 200, 500, 1000];

const Clientes = () => {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCliente, setSelectedCliente] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 50,
        total: 0,
        showSizeChanger: true,
        showQuickJumper: true,
        pageSizeOptions: PAGE_SIZES,
        showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} clientes`
    });

    const [sortInfo, setSortInfo] = useState({
        field: 'codigo',
        order: 'asc'
    });

    const fetchClientes = useCallback(async (
        page = pagination.current,
        pageSize = pagination.pageSize,
        search = searchText,
        sortField = sortInfo.field,
        sortOrder = sortInfo.order
    ) => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login', { replace: true });
                return;
            }

            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/clientes`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    params: {
                        page,
                        limit: pageSize,
                        search: search ? search.trim() : undefined,
                        sortField,
                        sortOrder
                    }
                }
            );

            const total = parseInt(response.headers['x-total-count']) || 0;

            setClientes(response.data);
            setPagination(prev => ({
                ...prev,
                current: page,
                pageSize: pageSize,
                total: total
            }));

        } catch (err) {
            console.error('Error al cargar clientes:', err);
            let errorMessage = 'Error al cargar los clientes';

            if (err.response) {
                switch (err.response.status) {
                    case 401:
                        navigate('/login', { replace: true });
                        return;
                    case 404:
                        errorMessage = 'No se encontraron clientes';
                        break;
                    case 500:
                        errorMessage = 'Error interno del servidor';
                        break;
                    default:
                        errorMessage = err.response.data?.message || errorMessage;
                }
            }

            setError(errorMessage);
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [navigate, pagination.current, pagination.pageSize, searchText, sortInfo.field, sortInfo.order]);

    useEffect(() => {
        fetchClientes();
    }, [fetchClientes]);

    const handleTableChange = (newPagination, filters, sorter) => {
        const newSortInfo = {
            field: sorter.field || 'codigo',
            order: sorter.order ? (sorter.order === 'ascend' ? 'asc' : 'desc') : 'asc'
        };
        setSortInfo(newSortInfo);
        fetchClientes(
            newPagination.current,
            newPagination.pageSize,
            searchText,
            newSortInfo.field,
            newSortInfo.order
        );
    };

    const handleSearch = debounce((value) => {
        setSearchText(value);
        fetchClientes(1, pagination.pageSize, value, sortInfo.field, sortInfo.order);
    }, 300);

    const handleCreate = () => {
        setSelectedCliente(null);
        setIsModalOpen(true);
    };

    const handleEdit = (record) => {
        setSelectedCliente(record);
        setIsModalOpen(true);
    };

    const handleDirecciones = (record) => {
        navigate(`/clientes/${record.codigo}/direcciones`);
    };

    const handleContactos = (record) => {
        navigate(`/clientes/${record.codigo}/contactos`);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedCliente(null);
    };

    const handleModalSuccess = () => {
        setIsModalOpen(false);
        setSelectedCliente(null);
        fetchClientes(pagination.current, pagination.pageSize, searchText);
        message.success(`Cliente ${selectedCliente ? 'actualizado' : 'creado'} exitosamente`);
    };

    const columns = [
        {
            title: 'RUT',
            dataIndex: 'rut',
            key: 'rut',
            sorter: true,
            width: '20%',
            render: (text) => text ? <Text copyable>{text}</Text> : '-'
        },
        {
            title: 'Nombre',
            dataIndex: 'nombre',
            key: 'nombre',
            sorter: true,
            width: '40%',
            render: (text) => <Text copyable>{text}</Text>
        },
        {
            title: 'Teléfono',
            dataIndex: 'fono',
            key: 'fono',
            width: '20%',
            render: (text) => text ? <Text copyable>{text}</Text> : '-'
        },
        {
            title: 'Acciones',
            key: 'acciones',
            width: '20%',
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="Editar cliente">
                        <Button
                            type="text"
                            icon={<EditOutlined style={{ fontSize: '16px', color: '#666' }} />}
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Direcciones">
                        <Button
                            type="text"
                            icon={<EnvironmentOutlined style={{ fontSize: '16px', color: '#1890ff' }} />}
                            onClick={() => handleDirecciones(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Contactos">
                        <Button
                            type="text"
                            icon={<PhoneOutlined style={{ fontSize: '16px', color: '#52c41a' }} />}
                            onClick={() => handleContactos(record)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Breadcrumb
                style={{ marginBottom: '16px' }}
                items={[
                    {
                        href: '/',
                        title: <><HomeOutlined /> Inicio</>,
                    },
                    {
                        title: <><UserOutlined /> Clientes</>,
                    },
                ]}
            />

            <Card
                title="Gestión de Clientes"
                extra={
                    <Space>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={() => fetchClientes(pagination.current, pagination.pageSize, searchText)}
                            loading={loading}
                        >
                            Actualizar
                        </Button>
                    </Space>
                }
            >
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space>
                        <Button
                            type="primary"
                            onClick={handleCreate}
                            icon={<PlusOutlined />}
                            style={{
                                backgroundColor: '#ff4d4f',
                                borderColor: '#ff4d4f'
                            }}
                        >
                            Crear Cliente
                        </Button>
                        <Search
                            placeholder="Buscar por nombre, RUT o teléfono"
                            onChange={(e) => handleSearch(e.target.value)}
                            value={searchText}
                            allowClear
                            style={{ width: 300 }}
                        />
                    </Space>

                    <Space>
                        <Text type="secondary">
                            Registros por página:
                        </Text>
                        <Select
                            value={pagination.pageSize}
                            onChange={(value) => {
                                setPagination(prev => ({ ...prev, pageSize: value, current: 1 }));
                                fetchClientes(1, value, searchText);
                            }}
                            style={{ width: 100 }}
                        >
                            {PAGE_SIZES.map(size => (
                                <Option key={size} value={size}>{size}</Option>
                            ))}
                        </Select>
                    </Space>
                </div>

                {error && (
                    <Alert
                        message="Error"
                        description={error}
                        type="error"
                        showIcon
                        style={{ marginBottom: 16 }}
                        action={
                            <Button
                                size="small"
                                type="primary"
                                onClick={() => fetchClientes(pagination.current, pagination.pageSize, searchText)}
                            >
                                Reintentar
                            </Button>
                        }
                    />
                )}

                <Table
                    dataSource={clientes}
                    columns={columns}
                    rowKey="codigo"
                    loading={loading}
                    onChange={handleTableChange}
                    pagination={pagination}
                    scroll={{ x: 1000, y: 'calc(100vh - 300px)' }}
                    size="middle"
                />

                <Modal
                    title={selectedCliente ? 'Editar Cliente' : 'Crear Cliente'}
                    open={isModalOpen}
                    footer={null}
                    onCancel={handleModalClose}
                    width={600}
                    maskClosable={false}
                    destroyOnClose
                    closeIcon={<CloseCircleOutlined />}
                >
                    <ClienteForm
                        cliente={selectedCliente}
                        onClose={handleModalClose}
                        onSuccess={handleModalSuccess}
                    />
                </Modal>
            </Card>
        </div>
    );
};

export default Clientes;
