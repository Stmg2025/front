import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Modal, message, Space, Tag, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, HomeOutlined, BankOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import DireccionForm from './DireccionForm';

const { confirm } = Modal;

const Direcciones = ({ clienteCodigo, clienteNombre }) => {
    const [direcciones, setDirecciones] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedDireccion, setSelectedDireccion] = useState(null);
    const [error, setError] = useState(null);

    const showError = (message, error) => {
        console.error(message, error);
        setError(error?.response?.data?.error || message);
        message.error(error?.response?.data?.error || message);
    };

    const fetchDirecciones = useCallback(async () => {
        if (!clienteCodigo) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/direcciones/cliente/${clienteCodigo}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setDirecciones(response.data);
            setError(null);
        } catch (error) {
            showError('Error al cargar las direcciones', error);
        } finally {
            setLoading(false);
        }
    }, [clienteCodigo]);

    useEffect(() => {
        fetchDirecciones();
    }, [fetchDirecciones]);

    const handleCreate = () => {
        setSelectedDireccion(null);
        setModalVisible(true);
    };

    const handleEdit = (record) => {
        setSelectedDireccion(record);
        setModalVisible(true);
    };

    const showDeleteConfirm = (direccion) => {
        if (direccion.es_principal && direcciones.length === 1) {
            message.warning('No se puede eliminar la única dirección del cliente');
            return;
        }

        confirm({
            title: '¿Estás seguro de eliminar esta dirección?',
            icon: <ExclamationCircleOutlined />,
            content: 'Esta acción no se puede deshacer',
            okText: 'Sí, eliminar',
            okType: 'danger',
            cancelText: 'No, cancelar',
            onOk() {
                handleDelete(direccion.id);
            },
        });
    };

    const handleDelete = async (id) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            await axios.delete(
                `${import.meta.env.VITE_BACKEND_URL}/direcciones/${id}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            message.success('Dirección eliminada exitosamente');
            fetchDirecciones();
        } catch (error) {
            if (error.response?.status === 400 &&
                error.response.data?.error === 'No se puede eliminar la única dirección activa del cliente') {
                message.error('No se puede eliminar la única dirección del cliente');
            } else {
                showError('Error al eliminar la dirección', error);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleModalClose = () => {
        setModalVisible(false);
        setSelectedDireccion(null);
    };

    const handleModalSave = () => {
        fetchDirecciones();
        handleModalClose();
    };

    const getTipoDireccionIcon = (tipo) => {
        switch (tipo?.toLowerCase()) {
            case 'casa':
                return <HomeOutlined />;
            case 'oficina':
            case 'trabajo':
                return <BankOutlined />;
            default:
                return null;
        }
    };

    const columns = [
        {
            title: 'Tipo',
            dataIndex: 'tipo_direccion',
            key: 'tipo_direccion',
            render: (tipo) => (
                <Space>
                    {getTipoDireccionIcon(tipo)}
                    {tipo || 'No especificado'}
                </Space>
            ),
            width: '15%',
        },
        {
            title: 'Dirección',
            dataIndex: 'direccion',
            key: 'direccion',
            render: (text, record) => (
                <>
                    {text} {record.numero}
                    {record.depto_oficina && ` Depto/Of: ${record.depto_oficina}`}
                    {record.es_principal && (
                        <Tag color="green" style={{ marginLeft: 8 }}>
                            Principal
                        </Tag>
                    )}
                </>
            ),
            width: '35%',
        },
        {
            title: 'Comuna',
            dataIndex: 'comuna',
            key: 'comuna',
            width: '15%',
        },
        {
            title: 'Ciudad',
            dataIndex: 'ciudad',
            key: 'ciudad',
            width: '15%',
        },
        {
            title: 'Referencia',
            dataIndex: 'referencia',
            key: 'referencia',
            ellipsis: true,
            width: '15%',
        },
        {
            title: 'Acciones',
            key: 'acciones',
            width: '10%',
            render: (_, record) => (
                <Space>
                    <Button
                        type="text"
                        icon={<EditOutlined style={{ fontSize: '16px', color: '#1890ff' }} />}
                        onClick={() => handleEdit(record)}
                        title="Editar dirección"
                    />
                    <Button
                        type="text"
                        icon={<DeleteOutlined style={{ fontSize: '16px', color: '#ff4d4f' }} />}
                        onClick={() => showDeleteConfirm(record)}
                        disabled={record.es_principal && direcciones.length === 1}
                        title={
                            record.es_principal && direcciones.length === 1
                                ? 'No se puede eliminar la única dirección'
                                : 'Eliminar dirección'
                        }
                    />
                </Space>
            ),
        },
    ];

    return (
        <Card
            title={`Direcciones de ${clienteNombre || ''}`}
            extra={
                <Button
                    type="primary"
                    onClick={handleCreate}
                    icon={<PlusOutlined />}
                >
                    Agregar Dirección
                </Button>
            }
        >
            {error && (
                <Alert
                    message="Error"
                    description={error}
                    type="error"
                    showIcon
                    closable
                    onClose={() => setError(null)}
                    style={{ marginBottom: 16 }}
                />
            )}

            <Table
                dataSource={direcciones}
                columns={columns}
                rowKey="id"
                loading={loading}
                pagination={false}
                scroll={{ x: true }}
            />

            <Modal
                title={selectedDireccion ? 'Editar Dirección' : 'Nueva Dirección'}
                open={modalVisible}
                onCancel={handleModalClose}
                footer={null}
                width={800}
                destroyOnClose
            >
                <DireccionForm
                    direccion={selectedDireccion}
                    clienteCodigo={clienteCodigo}
                    onClose={handleModalClose}
                    onSave={handleModalSave}
                    esPrimeraDireccion={!direcciones?.length}
                />
            </Modal>
        </Card>
    );
};

export default Direcciones;