import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, DatePicker, Select, Spin, Space } from 'antd';
import {
    PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import {
    FileDoneOutlined,
    UserOutlined,
    ClockCircleOutlined,
    LoadingOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { RangePicker } = DatePicker;

const Home = () => {
    const [loading, setLoading] = useState(true);
    const [solicitudes, setSolicitudes] = useState([]);
    const [tecnicos, setTecnicos] = useState([]);
    const [estados, setEstados] = useState([]);
    const [dateRange, setDateRange] = useState([]);
    const [selectedTecnico, setSelectedTecnico] = useState('all');
    const [stats, setStats] = useState({
        total: 0,
        pendientes: 0,
        enProceso: 0,
        completadas: 0
    });

    // Colores para los gráficos
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const [solicitudesRes, usuariosRes, estadosRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_BACKEND_URL}/solicitudes`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${import.meta.env.VITE_BACKEND_URL}/usuarios`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${import.meta.env.VITE_BACKEND_URL}/estado_tipos`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            setSolicitudes(solicitudesRes.data);
            setTecnicos(usuariosRes.data.filter(u => u.tipo_usuario === 'Tecnico'));
            setEstados(estadosRes.data);
            updateStats(solicitudesRes.data);
        } catch (error) {
            console.error('Error al cargar datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStats = (data) => {
        const filtered = filterData(data);
        setStats({
            total: filtered.length,
            pendientes: filtered.filter(s => s.estado_id === 1).length,
            enProceso: filtered.filter(s => s.estado_id === 2).length,
            completadas: filtered.filter(s => s.estado_id === 3).length,
        });
    };

    const filterData = (data) => {
        return data.filter(item => {
            const matchesTecnico = selectedTecnico === 'all' || item.tecnico === selectedTecnico;
            const matchesDate = !dateRange.length || (
                new Date(item.fecha_creacion) >= dateRange[0].startOf('day') &&
                new Date(item.fecha_creacion) <= dateRange[1].endOf('day')
            );
            return matchesTecnico && matchesDate;
        });
    };

    const getEstadoStats = () => {
        const filtered = filterData(solicitudes);
        const estadoCount = estados.map(estado => ({
            name: estado.descripcion,
            value: filtered.filter(s => s.estado_id === estado.id).length
        }));
        return estadoCount;
    };

    const getTecnicoStats = () => {
        const filtered = filterData(solicitudes);
        return tecnicos.map(tecnico => ({
            name: `${tecnico.nombre} ${tecnico.apellido}`,
            solicitudes: filtered.filter(s => s.tecnico === tecnico.correo_electronico).length
        }));
    };

    const handleDateChange = (dates) => {
        setDateRange(dates);
        updateStats(solicitudes);
    };

    const handleTecnicoChange = (value) => {
        setSelectedTecnico(value);
        updateStats(solicitudes);
    };

    return (
        <Spin spinning={loading} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}>
            <div style={{ padding: '24px' }}>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <Row gutter={[16, 16]} justify="end">
                        <Col>
                            <Space>
                                <RangePicker onChange={handleDateChange} />
                                <Select
                                    style={{ width: 200 }}
                                    placeholder="Seleccionar Técnico"
                                    onChange={handleTecnicoChange}
                                    defaultValue="all"
                                >
                                    <Select.Option value="all">Todos los Técnicos</Select.Option>
                                    {tecnicos.map(tecnico => (
                                        <Select.Option
                                            key={tecnico.correo_electronico}
                                            value={tecnico.correo_electronico}
                                        >
                                            {`${tecnico.nombre} ${tecnico.apellido}`}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Space>
                        </Col>
                    </Row>

                    {/* Estadísticas Generales */}
                    <Row gutter={16}>
                        <Col xs={24} sm={12} lg={6}>
                            <Card>
                                <Statistic
                                    title="Total Solicitudes"
                                    value={stats.total}
                                    prefix={<FileDoneOutlined />}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <Card>
                                <Statistic
                                    title="Pendientes"
                                    value={stats.pendientes}
                                    prefix={<ClockCircleOutlined />}
                                    valueStyle={{ color: '#cf1322' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <Card>
                                <Statistic
                                    title="En Proceso"
                                    value={stats.enProceso}
                                    prefix={<UserOutlined />}
                                    valueStyle={{ color: '#096dd9' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <Card>
                                <Statistic
                                    title="Completadas"
                                    value={stats.completadas}
                                    prefix={<FileDoneOutlined />}
                                    valueStyle={{ color: '#3f8600' }}
                                />
                            </Card>
                        </Col>
                    </Row>

                    {/* Gráficos */}
                    <Row gutter={16}>
                        <Col xs={24} lg={12}>
                            <Card title="Solicitudes por Estado">
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={getEstadoStats()}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {getEstadoStats().map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Card>
                        </Col>
                        <Col xs={24} lg={12}>
                            <Card title="Solicitudes por Técnico">
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart
                                        data={getTecnicoStats()}
                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="solicitudes" fill="#8884d8">
                                            {getTecnicoStats().map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </Card>
                        </Col>
                    </Row>
                </Space>
            </div>
        </Spin>
    );
};

export default Home;