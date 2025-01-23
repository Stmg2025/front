import React, { useState } from 'react';
import { Button, Form, Input, message } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (values) => {
        setLoading(true);
        const apiUrl = window.location.hostname === 'localhost'
            ? 'http://localhost:3000'
            : 'https://back-mu-ochre.vercel.app';

        try {
            const response = await axios.post(`${apiUrl}/usuarios/login`, {
                correo_electronico: values.email,
                contrasena: values.password,
            });

            localStorage.setItem('token', response.data.token);
            message.success('Inicio de sesión exitoso');
            navigate('/');
        } catch (error) {
            console.error('Error:', error);
            message.error('Credenciales incorrectas');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto' }}>
            <h1>Inicio de Sesión</h1>
            <Form
                layout="vertical"
                onFinish={handleLogin}
            >
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
                    <Button type="primary" htmlType="submit" loading={loading} block>
                        Iniciar Sesión
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default Login;