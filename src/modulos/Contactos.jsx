import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, message, Space, Tag, Tooltip } from 'antd';
import {
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    UserOutlined,
    StarFilled,
    PhoneOutlined,
    MailOutlined
} from '@ant-design/icons';
import axios from 'axios';
import ContactoForm from './ContactoForm';

const Contactos = ({ clienteCodigo, clienteNombre }) => {
    const [contactos, setContactos] = useState();
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedContacto, setSelectedContacto] = useState(null);

    const fetchContactos = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/contactos/cliente/${clienteCodigo}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setContactos(response.data);
        } catch (error) {
            console.error('Error al cargar contactos:', error);
            message.error('Error al cargar los contactos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (clienteCodigo) {
            fetchContactos();
        }
    }, [clienteCodigo]);

    const handleCreate = () => {
        setSelectedContacto(null);
        setIsModalVisible(true);
    };

    const handleEdit = (record) => {
        setSelectedContacto(record);
        setIsModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(
                `${import.meta.env.VITE_BACKEND_URL}/contactos/${id}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            message.success('Contacto eliminado exitosamente');
            fetchContactos();
        } catch (error) {
            console.error('Error al eliminar contacto:', error);
            message.error('Error al eliminar el contacto');
        }
    };

    const handleModalClose = () => {
        setIsModalVisible(false);
        setSelectedContacto(null);
    };

    const handleModalSave = () => {
        fetchContactos();
        setIsModalVisible(false);
    };

    const columns = [
        {
            title: 'Nombre',
            key: 'nombre_completo',
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <Space>
                        {record.es_principal && (
                            <Tooltip title="Contacto Principal">
                                <StarFilled style={{ color: '#faad14' }} />
                            </Tooltip>
                        )}
                        <span>
                            {record.nombre} {record.apellido}
                        </span>
                    </Space>
                    {record.cargo && (
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            {record.cargo}
                            {record.departamento && ` - ${record.departamento}`}
                        </Text>
                    )}
                </Space>
            ),
            width: '30%',
        },
        {
            title: 'Contacto',
            key: 'contacto',
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    {record.telefono && (
                        <Space>
                            <PhoneOutlined />
                            <span>{record.telefono}</span>
                            {record.extension && <Tag>Ext: {record.extension}</Tag>}
                        </Space>
                    )}
                    {record.email && (
                        <Space>
                            <MailOutlined />
                            <span>{record.email}</span>
                        </Space>
                    )}
                </Space>
            ),
            width: '30%',
        },
        {
            title: 'RUT',
            dataIndex: 'rut',
            key: 'rut',
            width: '20%',
        },
        {
            title: 'Acciones',
            key: 'acciones',
            width: '20%',
            render: (_, record) => (
                <Space>
                    <Tooltip title="Editar contacto">
                        <Button
                            type="text"
                            icon={<EditOutlined style={{ fontSize: '16px', color: '#1890ff' }} />}
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Eliminar contacto">
                        <Button
                            type="text"
                            icon={<DeleteOutlined style={{ fontSize: '16px', color: '#ff4d4f' }} />}
                            onClick={() => handleDelete(record.id)}
                            disabled={record.es_principal}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <Card
            title={`Contactos de ${clienteNombre}`}
            extra={
                <Button
                    type="primary"
                    onClick={handleCreate}
                    icon={<PlusOutlined />}
                >
                    Agregar Contacto
                </Button>
            }
        >
            <Table
                dataSource={contactos}
                columns={columns}
                rowKey="id"
                loading={loading}
                pagination={false}
            />

            <Modal
                title={selectedContacto ? 'Editar Contacto' : 'Nuevo Contacto'}
                open={isModalVisible}
                onCancel={handleModalClose}
                footer={null}
                width={800}
            >
                <ContactoForm
                    contacto={selectedContacto}
                    clienteCodigo={clienteCodigo}
                    onClose={handleModalClose}
                    onSave={handleModalSave}
                    esPrimerContacto={!contactos?.length}
                />
            </Modal>
        </Card>
    );
};

export default Contactos;