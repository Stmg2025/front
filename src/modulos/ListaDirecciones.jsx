import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Table,
    Input,
    Button,
    Space,
    Card,
    message,
    Tag,
    Alert,
    Tooltip,
    Typography,
    Breadcrumb,
    Select
} from 'antd';
import {
    SearchOutlined,
    EnvironmentOutlined,
    HomeOutlined,
    BankOutlined,
    ReloadOutlined,
    ExportOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { debounce } from 'lodash';
import * as XLSX from 'xlsx';

const { Search } = Input;
const { Text } = Typography;
const { Option } = Select;

const PAGE_SIZES = [10, 20, 50, 100, 200, 500, 1000];

const ListaDirecciones = () => {
    const [direcciones, setDirecciones] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [error, setError] = useState(null);
    const [clientesCache, setClientesCache] = useState(new Map());
    const [exportLoading, setExportLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 50,
        total: 0,
        showSizeChanger: true,
        showQuickJumper: true,
        pageSizeOptions: PAGE_SIZES,
        showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} direcciones`
    });

    const navigate = useNavigate();

    const fetchDirecciones = useCallback(async (page = 1, pageSize = pagination.pageSize) => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login', { replace: true });
                return;
            }

            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/direcciones`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    params: {
                        page,
                        limit: pageSize,
                        search: searchText
                    }
                }
            );

            // Obtener códigos únicos de clientes que no están en caché
            const clientesNoEnCache = [...new Set(
                response.data
                    .filter(dir => !clientesCache.has(dir.cliente_codigo))
                    .map(dir => dir.cliente_codigo)
            )];

            if (clientesNoEnCache.length > 0) {
                const clientesPromises = clientesNoEnCache.map(async (codigo) => {
                    try {
                        const clienteResponse = await axios.get(
                            `${import.meta.env.VITE_BACKEND_URL}/clientes/${codigo}`,
                            {
                                headers: { Authorization: `Bearer ${token}` }
                            }
                        );
                        return { codigo, nombre: clienteResponse.data.nombre };
                    } catch (error) {
                        console.error(`Error al obtener cliente ${codigo}:`, error);
                        return { codigo, nombre: 'Cliente no encontrado' };
                    }
                });

                const clientesResults = await Promise.all(clientesPromises);
                const newCache = new Map(clientesCache);
                clientesResults.forEach(({ codigo, nombre }) => {
                    newCache.set(codigo, nombre);
                });
                setClientesCache(newCache);
            }

            // Combinar datos de direcciones con nombres de clientes
            const direccionesConClientes = response.data.map(direccion => ({
                ...direccion,
                cliente_nombre: clientesCache.get(direccion.cliente_codigo) || 'Cargando...'
            }));

            setDirecciones(direccionesConClientes);
            setPagination(prev => ({
                ...prev,
                current: page,
                pageSize: pageSize,
                total: response.headers['x-total-count'] || direccionesConClientes.length
            }));

            setError(null);
        } catch (err) {
            console.error('Error al cargar direcciones:', err);
            let errorMessage = 'Error al cargar las direcciones';

            if (err.response) {
                switch (err.response.status) {
                    case 401:
                        navigate('/login', { replace: true });
                        return;
                    case 404:
                        errorMessage = 'No se encontraron direcciones';
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
    }, [clientesCache, navigate, searchText]);

    useEffect(() => {
        fetchDirecciones(1, pagination.pageSize);
    }, [fetchDirecciones]);

    const handleTableChange = (newPagination, filters, sorter) => {
        fetchDirecciones(newPagination.current, newPagination.pageSize);
    };

    const handleSearch = debounce((value) => {
        setSearchText(value.toLowerCase());
        fetchDirecciones(1, pagination.pageSize); // Reset a la primera página con la nueva búsqueda
    }, 300);

    const handleExportExcel = async () => {
        try {
            setExportLoading(true);

            // Obtener todos los datos para exportar
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/direcciones/export`, // Endpoint especial para exportación
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            const exportData = response.data.map(dir => ({
                'Cliente': dir.cliente_nombre,
                'Dirección': `${dir.direccion} ${dir.numero}${dir.depto_oficina ? ` ${dir.depto_oficina}` : ''}`,
                'Comuna': dir.comuna,
                'Ciudad': dir.ciudad,
                'Región': dir.region,
                'Tipo': dir.tipo_direccion,
                'Es Principal': dir.es_principal ? 'Sí' : 'No',
                'Referencia': dir.referencia || '',
                'Código Postal': dir.codigo_postal || '',
                'Fecha Creación': new Date(dir.created_at).toLocaleString()
            }));

            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(exportData);

            const colWidths = [
                { wch: 30 }, // Cliente
                { wch: 40 }, // Dirección
                { wch: 20 }, // Comuna
                { wch: 20 }, // Ciudad
                { wch: 25 }, // Región
                { wch: 15 }, // Tipo
                { wch: 12 }, // Es Principal
                { wch: 30 }, // Referencia
                { wch: 15 }, // Código Postal
                { wch: 20 }  // Fecha Creación
            ];
            ws['!cols'] = colWidths;

            XLSX.utils.book_append_sheet(wb, ws, 'Direcciones');
            XLSX.writeFile(wb, `direcciones_${new Date().toISOString().split('T')[0]}.xlsx`);

            message.success('Archivo exportado exitosamente');
        } catch (error) {
            console.error('Error al exportar:', error);
            message.error('Error al exportar el archivo');
        } finally {
            setExportLoading(false);
        }
    };

    const getTipoDireccionIcon = useCallback((tipo) => {
        switch (tipo?.toLowerCase()) {
            case 'casa':
                return <HomeOutlined />;
            case 'oficina':
            case 'trabajo':
                return <BankOutlined />;
            default:
                return <EnvironmentOutlined />;
        }
    }, []);

    const columns = [
        {
            title: 'Cliente',
            dataIndex: 'cliente_nombre',
            key: 'cliente_nombre',
            sorter: true,
            render: (text, record) => (
                <Button
                    type="link"
                    onClick={() => navigate(`/clientes/${record.cliente_codigo}`)}
                >
                    {text}
                </Button>
            ),
            width: '20%',
            fixed: 'left'
        },
        {
            title: 'Dirección',
            key: 'direccion_completa',
            render: (_, record) => (
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <div>
                        <Text>
                            {record.direccion} {record.numero}
                            {record.depto_oficina && ` Depto/Of: ${record.depto_oficina}`}
                        </Text>
                    </div>
                    <Space size="small" wrap>
                        {record.es_principal && (
                            <Tag color="green">Principal</Tag>
                        )}
                        <Tooltip title={record.tipo_direccion}>
                            <Tag color="blue" icon={getTipoDireccionIcon(record.tipo_direccion)}>
                                {record.tipo_direccion || 'No especificado'}
                            </Tag>
                        </Tooltip>
                    </Space>
                </Space>
            ),
            width: '30%'
        },
        {
            title: 'Comuna',
            dataIndex: 'comuna',
            key: 'comuna',
            sorter: true,
            width: '15%'
        },
        {
            title: 'Ciudad',
            dataIndex: 'ciudad',
            key: 'ciudad',
            sorter: true,
            width: '15%'
        },
        {
            title: 'Región',
            dataIndex: 'region',
            key: 'region',
            sorter: true,
            width: '15%'
        },
        {
            title: 'Acciones',
            key: 'acciones',
            fixed: 'right',
            width: '10%',
            render: (_, record) => (
                <Space>
                    <Tooltip title="Ver todas las direcciones">
                        <Button
                            type="primary"
                            icon={<EnvironmentOutlined />}
                            onClick={() => navigate(`/clientes/${record.cliente_codigo}/direcciones`)}
                        >
                            Ver Todas
                        </Button>
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
                        title: <><EnvironmentOutlined /> Direcciones</>,
                    },
                ]}
            />

            <Card
                title="Direcciones de Clientes"
                extra={
                    <Space>
                        <Button
                            icon={<ExportOutlined />}
                            onClick={handleExportExcel}
                            loading={exportLoading}
                            disabled={loading || !direcciones.length}
                        >
                            Exportar
                        </Button>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={() => fetchDirecciones(pagination.current, pagination.pageSize)}
                            loading={loading}
                        >
                            Actualizar
                        </Button>
                    </Space>
                }
            >
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                    {error && (
                        <Alert
                            message="Error"
                            description={error}
                            type="error"
                            showIcon
                            action={
                                <Button size="small" type="primary" onClick={() => fetchDirecciones(pagination.current, pagination.pageSize)}>
                                    Reintentar
                                </Button>
                            }
                        />
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <Search
                            placeholder="Buscar por cliente, dirección, comuna o ciudad"
                            onSearch={handleSearch}
                            onChange={(e) => handleSearch(e.target.value)}
                            style={{ width: 400 }}
                            allowClear
                            loading={loading}
                        />
                        <Space>
                            <Text type="secondary">
                                Registros por página:
                            </Text>
                            <Select
                                value={pagination.pageSize}
                                onChange={(value) => {
                                    setPagination(prev => ({ ...prev, pageSize: value, current: 1 }));
                                    fetchDirecciones(1, value);
                                }}
                                style={{ width: 100 }}
                            >
                                {PAGE_SIZES.map(size => (
                                    <Option key={size} value={size}>{size}</Option>
                                ))}
                            </Select>
                        </Space>
                    </div>

                    <Table
                        columns={columns}
                        dataSource={direcciones}
                        rowKey="id"
                        loading={loading}
                        pagination={pagination}
                        onChange={handleTableChange}
                        scroll={{ x: 1300, y: 'calc(100vh - 300px)' }}
                        size="middle"
                    />
                </Space>
            </Card>
        </div>
    );
};

export default ListaDirecciones;