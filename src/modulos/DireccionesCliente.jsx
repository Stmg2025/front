import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, message, Alert, Skeleton, Breadcrumb } from 'antd';
import { ArrowLeftOutlined, HomeOutlined, UserOutlined, EnvironmentOutlined } from '@ant-design/icons';
import axios from 'axios';
import Direcciones from './Direcciones';

const DireccionesCliente = () => {
    const { codigo } = useParams();
    const navigate = useNavigate();
    const [cliente, setCliente] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCliente = useCallback(async () => {
        if (!codigo) {
            setError('Código de cliente no proporcionado');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login', { replace: true });
                return;
            }

            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/clientes/${codigo}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data) {
                setCliente(response.data);
                setError(null);
            } else {
                setError('Cliente no encontrado');
            }
        } catch (error) {
            console.error('Error al cargar cliente:', error);
            let errorMessage = 'Error al cargar los datos del cliente';

            if (error.response) {
                switch (error.response.status) {
                    case 401:
                        navigate('/login', { replace: true });
                        return;
                    case 404:
                        errorMessage = 'Cliente no encontrado';
                        break;
                    case 500:
                        errorMessage = 'Error interno del servidor';
                        break;
                    default:
                        errorMessage = error.response.data?.message || errorMessage;
                }
            }

            setError(errorMessage);
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [codigo, navigate]);

    useEffect(() => {
        fetchCliente();
    }, [fetchCliente]);

    const handleBack = () => {
        navigate('/clientes');
    };

    const handleRetry = () => {
        fetchCliente();
    };

    if (loading) {
        return (
            <div style={{ padding: '24px' }}>
                <Card>
                    <Skeleton active paragraph={{ rows: 4 }} />
                </Card>
            </div>
        );
    }

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
                        href: '/clientes',
                        title: <><UserOutlined /> Clientes</>,
                    },
                    {
                        title: <><EnvironmentOutlined /> Direcciones</>,
                    },
                ]}
            />

            <Card
                title={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Button
                            icon={<ArrowLeftOutlined />}
                            style={{ marginRight: '15px' }}
                            onClick={handleBack}
                            title="Volver a la lista de clientes"
                        />
                        {cliente ? `Direcciones de ${cliente.nombre}` : 'Cliente no encontrado'}
                    </div>
                }
                extra={
                    error && (
                        <Button type="primary" onClick={handleRetry}>
                            Reintentar
                        </Button>
                    )
                }
            >
                {error ? (
                    <Alert
                        message="Error"
                        description={error}
                        type="error"
                        showIcon
                        action={
                            <Button size="small" type="primary" onClick={handleRetry}>
                                Reintentar
                            </Button>
                        }
                    />
                ) : cliente ? (
                    <Direcciones
                        clienteCodigo={codigo}
                        clienteNombre={cliente.nombre}
                        key={codigo} // Forzar remontaje si cambia el código
                    />
                ) : (
                    <Alert
                        message="Cliente no encontrado"
                        description="No se encontró información del cliente solicitado"
                        type="warning"
                        showIcon
                    />
                )}
            </Card>
        </div>
    );
};

export default DireccionesCliente;