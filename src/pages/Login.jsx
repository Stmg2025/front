import React, { useState } from 'react';
import { Button, Form, Input, message, Card } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import background from '../assets/Flota-camiones-Maigas-1.jpg';
import logo from '../assets/logo.png';

const Login = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (values) => {
        setLoading(true);
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/usuarios/login`, {
                correo_electronico: values.email,
                contrasena: values.password,
            });

            // Debug: Ver la respuesta completa
            console.log('Respuesta del servidor:', response.data);

            // Guardar el token
            localStorage.setItem('token', response.data.token);

            // Guardar la información del usuario
            localStorage.setItem('user', JSON.stringify(response.data.user));

            // Debug: Verificar lo que se guardó
            console.log('Token guardado:', localStorage.getItem('token'));
            console.log('Usuario guardado:', localStorage.getItem('user'));

            message.success('Inicio de sesión exitoso');
            navigate('/');
        } catch (error) {
            message.error('Credenciales incorrectas o error de red');
            console.error('Error completo:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                backgroundImage: `url(${background})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            <Card
                style={{
                    width: 400,
                    textAlign: 'center',
                    padding: '30px',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                }}
            >
                <img
                    src={logo}
                    alt="Logo"
                    style={{ width: '100px', marginBottom: '20px' }}
                />
                <h2
                    style={{
                        marginBottom: '10px',
                        fontSize: '1.2rem',
                        color: '#333',
                    }}
                >
                    Bienvenido a
                </h2>
                <h2
                    style={{
                        marginBottom: '20px',
                        fontSize: '1.5rem',
                        color: 'red',
                        fontWeight: 'bold',
                    }}
                >
                    Servicio Técnico Maigas
                </h2>
                <Form layout="vertical" onFinish={handleLogin}>
                    <Form.Item
                        label="Correo Electrónico"
                        name="email"
                        rules={[{ required: true, message: 'Por favor, ingrese su correo electrónico' }]}
                    >
                        <Input type="email" placeholder="Correo Electrónico" />
                    </Form.Item>
                    <Form.Item
                        label="Contraseña"
                        name="password"
                        rules={[{ required: true, message: 'Por favor, ingrese su contraseña' }]}
                    >
                        <Input.Password placeholder="Contraseña" />
                    </Form.Item>
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            block
                            style={{
                                backgroundColor: 'red',
                                borderColor: 'red',
                            }}
                        >
                            Iniciar Sesión
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default Login;