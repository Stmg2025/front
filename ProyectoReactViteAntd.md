
# Proyecto React con Vite y Ant Design

## Estructura del Proyecto
```
front/
│
├── public/                # Archivos estáticos accesibles públicamente
│   └── favicon.ico        # Ícono del sitio
│
├── src/                   # Código fuente del proyecto
│   ├── assets/            # Recursos estáticos como imágenes o estilos globales
│   ├── components/        # Componentes reutilizables de la aplicación
│   │   └── Header.jsx     # Componente del encabezado
│   ├── pages/             # Páginas principales (rutas)
│   │   ├── Home.jsx       # Página de inicio
│   │   └── Login.jsx      # Página de inicio de sesión
│   ├── App.jsx            # Punto de entrada de los componentes
│   ├── main.jsx           # Archivo de entrada principal
│   ├── styles/            # Estilos globales o específicos
│   │   └── index.css      # Estilos globales
│   └── utils/             # Funciones y helpers reutilizables
│
├── .env                   # Variables de entorno
├── .gitignore             # Archivos ignorados por Git
├── package.json           # Configuración y dependencias del proyecto
├── README.md              # Documentación del proyecto
└── vite.config.js         # Configuración de Vite
```

## Dependencias Instaladas
- **react-router-dom**: Manejo de rutas.
- **antd**: Componentes de diseño profesional.
- **axios**: Para realizar solicitudes HTTP.

## Código Implementado

### 1. `src/main.jsx`
```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'antd/dist/reset.css'; // Estilos de Ant Design
import './styles/index.css';  // Estilos globales propios

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
```

### 2. `src/App.jsx`
```javascript
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Header from './components/Header';
import PrivateRoute from './components/PrivateRoute';

const App = () => (
    <Router>
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route
                path="/"
                element={
                    <PrivateRoute>
                        <Header />
                        <Home />
                    </PrivateRoute>
                }
            />
        </Routes>
    </Router>
);

export default App;
```

### 3. `src/pages/Login.jsx`
```javascript
import React, { useState } from 'react';
import { Button, Form, Input, message } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
            message.error('Credenciales incorrectas');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto' }}>
            <h1>Inicio de Sesión</h1>
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
                    <Button type="primary" htmlType="submit" loading={loading} block>
                        Iniciar Sesión
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default Login;
```

### 4. `src/components/PrivateRoute.jsx`
```javascript
import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
```

### 5. `src/components/Header.jsx`
```javascript
import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Header } = Layout;

const AppHeader = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <Header>
            <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['1']}>
                <Menu.Item key="1">Inicio</Menu.Item>
                <Menu.Item key="2" onClick={handleLogout}>
                    Cerrar Sesión
                </Menu.Item>
            </Menu>
        </Header>
    );
};

export default AppHeader;
```

### 6. `src/styles/index.css`
```css
body, h1, h2, h3, p, ul, li {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: Arial, sans-serif;
    background-color: #f0f2f5;
    color: #333;
    min-height: 100vh;
    margin: 0;
}

a {
    text-decoration: none;
    color: inherit;
}

#root {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 20px;
}
```

### 7. `.env`
```plaintext
VITE_BACKEND_URL=https://back-mu-ochre.vercel.app
```

## Instrucciones para probar
1. Ejecuta el frontend con `npm run dev`.
2. Accede a `http://localhost:3000/login` para iniciar sesión.
3. Prueba rutas protegidas (redirige al login si no hay sesión).

---

Avísame si necesitas más cambios o nuevas funcionalidades. ¡Gracias! 😊
