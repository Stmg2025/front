import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import axios from 'axios';
import Contactos from './Contactos';

const ContactosCliente = () => {
    const { codigo } = useParams();
    const navigate = useNavigate();
    const [cliente, setCliente] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCliente = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(
                    `${import.meta.env.VITE_BACKEND_URL}/clientes/${codigo}`,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );
                setCliente(response.data);
            } catch (error) {
                message.error('Error al cargar los datos del cliente');
                console.error('Error al cargar cliente:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCliente();
    }, [codigo]);

    return (
        <div style={{ padding: '24px' }}>
            <Card
                loading={loading}
                title={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Button
                            icon={<ArrowLeftOutlined />}
                            style={{ marginRight: '15px' }}
                            onClick={() => navigate('/clientes')}
                        />
                        {cliente ? `Contactos de ${cliente.nombre}` : 'Cargando...'}
                    </div>
                }
            >
                {cliente && (
                    <Contactos
                        clienteCodigo={codigo}
                        clienteNombre={cliente.nombre}
                    />
                )}
            </Card>
        </div>
    );
};

export default ContactosCliente;