import React, { useState } from 'react';
import { Button, Form, Input, message, Card } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import background from '../assets/Flota-camiones-Maigas-1.jpg'; // Importa la imagen de fondo
import logo from '../assets/logo.png'; // Importa el logo

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

            message.success('Inicio de sesión exitoso');
            localStorage.setItem('token', response.data.token);
            navigate('/');
        } catch (error) {
            message.error('Credenciales incorrectas o error de red');
            console.error(error);
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
                backgroundImage: `url(${background})`, // Imagen de fondo importada
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
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)', // Más sombra
                    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Fondo semitransparente
                }}
            >
                <img
                    src={logo} // Logo importado
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
                        color: 'red', // Color rojo
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
                                backgroundColor: 'red', // Botón rojo
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
