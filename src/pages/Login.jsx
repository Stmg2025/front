import React, { useState } from 'react';
import { Button, Form, Input, message } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [loading, setLoading] = useState(false); // Estado para el botón de carga
    const navigate = useNavigate(); // Navegación programática

    const handleLogin = async (values) => {
        setLoading(true);
        try {
            // Realizar la solicitud al backend
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/usuarios/login`, {
                correo_electronico: values.email,
                contrasena: values.password,
            });

            // Mostrar mensaje de éxito
            message.success('Inicio de sesión exitoso');
            // Guardar el token en LocalStorage
            localStorage.setItem('token', response.data.token);
            // Redirigir al usuario a la página principal
            navigate('/');
        } catch (error) {
            // Manejo de errores
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
                onFinish={handleLogin} // Manejo del envío del formulario
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
