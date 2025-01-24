import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Modal, message } from 'antd';
import axios from 'axios';
import SolicitudForm from './SolicitudForm';

const Solicitudes = () => {
    const [solicitudes, setSolicitudes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSolicitud, setSelectedSolicitud] = useState(null);

    const fetchSolicitudes = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/solicitudes`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSolicitudes(response.data);
        } catch (error) {
            message.error('Error al cargar solicitudes');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearch(e.target.value);
    };

    const filteredSolicitudes = solicitudes.filter((s) =>
        s.detalles.toLowerCase().includes(search.toLowerCase()) ||
        s.creado_por.toLowerCase().includes(search.toLowerCase())
    );

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
    }, []);

    return (
        <div>
            <h1>Solicitudes</h1>
            <Input.Search
                placeholder="Buscar solicitud por detalles o creado por"
                value={search}
                onChange={handleSearch}
                style={{ marginBottom: 20 }}
            />
            <Button type="primary" onClick={handleCreate} style={{ marginBottom: 20 }}>
                Crear Solicitud
            </Button>
            <Table
                dataSource={filteredSolicitudes}
                columns={[
                    { title: 'Número', dataIndex: 'solicitud_numero', key: 'solicitud_numero' },
                    { title: 'Detalles', dataIndex: 'detalles', key: 'detalles' },
                    { title: 'Fecha', dataIndex: 'fecha_creacion', key: 'fecha_creacion' },
                    { title: 'Creado Por', dataIndex: 'creado_por', key: 'creado_por' },
                    {
                        title: 'Acciones',
                        render: (text, record) => (
                            <Button onClick={() => handleEdit(record)}>Editar</Button>
                        ),
                    },
                ]}
                rowKey="solicitud_numero"
                loading={loading}
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
                />
            </Modal>
        </div>
    );
};

export default Solicitudes;
