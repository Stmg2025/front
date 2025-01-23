
# Proyecto React con Vite y Ant Design

## Tecnologías Utilizadas
- **React**: Framework de JavaScript para construir interfaces de usuario.
- **Vite**: Herramienta de construcción rápida con soporte para HMR.
- **Ant Design**: Librería de componentes UI para crear interfaces profesionales.
- **React Router DOM**: Manejo de rutas para la navegación.
- **Axios**: Cliente HTTP para consumir APIs.
- **Vercel**: Plataforma de despliegue.

---

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
│   │   ├── Header.jsx     # Componente del encabezado
│   │   └── PrivateRoute.jsx # Protección de rutas
│   ├── pages/             # Páginas principales (rutas)
│   │   ├── Home.jsx       # Página de inicio
│   │   └── Login.jsx      # Página de inicio de sesión
│   ├── App.jsx            # Punto de entrada de los componentes
│   ├── main.jsx           # Archivo de entrada principal
│   ├── styles/            # Estilos globales o específicos
│   │   └── index.css      # Estilos globales
│   └── utils/             # Funciones y helpers reutilizables (vacío por ahora)
│
├── .env                   # Variables de entorno
├── .gitignore             # Archivos ignorados por Git
├── package.json           # Configuración y dependencias del proyecto
├── README.md              # Documentación del proyecto
└── vite.config.js         # Configuración de Vite
```

---

## Principales Funcionalidades Implementadas
1. **Inicio de Sesión**:
   - Página de login conectada con el backend en **Vercel** (`https://back-mu-ochre.vercel.app`).
   - Manejo de token JWT para proteger rutas.

2. **Rutas Protegidas**:
   - Solo los usuarios autenticados pueden acceder al contenido protegido como la página de inicio.

3. **Cierre de Sesión**:
   - Opción para cerrar sesión desde el encabezado.

4. **Diseño Profesional**:
   - Uso de **Ant Design** para componentes estilizados como formularios, botones y menús.

---

## Código Principal
### 1. Punto de entrada (`src/main.jsx`)
```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'antd/dist/reset.css';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
```

### 2. Configuración de rutas (`src/App.jsx`)
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

---

## Variables de Entorno (`.env`)
```plaintext
VITE_BACKEND_URL=https://back-mu-ochre.vercel.app
```

---

## Instrucciones para Desplegar en Vercel
1. Instala la CLI de Vercel:
   ```bash
   npm install -g vercel
   ```
2. Inicia sesión:
   ```bash
   vercel login
   ```
3. Despliega el proyecto:
   ```bash
   vercel
   ```
