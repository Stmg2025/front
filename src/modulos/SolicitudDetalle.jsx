import React, { useEffect, useState, useRef } from 'react';
import { Card, Button, Descriptions, Spin, Input, Select, message, Space } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { DownloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const SolicitudDetalle = () => {
    const { solicitudNumero } = useParams();
    const navigate = useNavigate();
    const [solicitud, setSolicitud] = useState(null);
    const [loading, setLoading] = useState(false);
    const [tecnicos, setTecnicos] = useState([]);
    const [estados, setEstados] = useState([]);
    const [editingField, setEditingField] = useState(null);
    const [editedValue, setEditedValue] = useState('');
    const contentRef = useRef(null);

    const fetchSolicitudDetalle = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const [solicitudResponse, usuariosResponse, estadosResponse] = await Promise.all([
                axios.get(
                    `${import.meta.env.VITE_BACKEND_URL}/solicitudes/${solicitudNumero}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                ),
                axios.get(`${import.meta.env.VITE_BACKEND_URL}/usuarios`, {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                axios.get(`${import.meta.env.VITE_BACKEND_URL}/estado_tipos`, {
                    headers: { Authorization: `Bearer ${token}` },
                })
            ]);

            setSolicitud(solicitudResponse.data);
            setTecnicos(usuariosResponse.data.filter(usuario => usuario.tipo_usuario === 'Tecnico'));
            setEstados(estadosResponse.data);
        } catch (error) {
            console.error('Error al cargar datos:', error);
            message.error('Error al cargar los datos de la solicitud.');
        } finally {
            setLoading(false);
        }
    };

    const getEstadoDescripcion = (estado_id) => {
        const estado = estados.find(e => e.id === estado_id);
        return estado ? estado.descripcion : 'Desconocido';
    };

    const getTecnicoNombre = (correo_electronico) => {
        const tecnico = tecnicos.find(t => t.correo_electronico === correo_electronico);
        return tecnico ? `${tecnico.nombre} ${tecnico.apellido}` : 'No asignado';
    };

    const formatFechaHora = (fecha) => {
        const date = new Date(fecha);
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    };

    const handleEdit = (field, currentValue) => {
        setEditingField(field);
        setEditedValue(currentValue);
    };

    const handleSave = async (field) => {
        try {
            const token = localStorage.getItem('token');
            const dataToUpdate = { [field]: editedValue };

            await axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/solicitudes/${solicitudNumero}`,
                dataToUpdate,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSolicitud(prev => ({ ...prev, [field]: editedValue }));
            setEditingField(null);
            message.success('Campo actualizado con éxito');
            await fetchSolicitudDetalle();
        } catch (error) {
            console.error('Error al actualizar:', error);
            message.error('Error al actualizar el campo.');
        }
    };

    const handleCancel = () => {
        setEditingField(null);
        setEditedValue('');
    };

    const generatePDF = async () => {
        try {
            message.loading({ content: 'Generando PDF...', key: 'pdfGeneration' });
            const content = contentRef.current;

            // Ocultar temporalmente los botones de edición
            const editButtons = content.querySelectorAll('button');
            editButtons.forEach(button => {
                button.style.display = 'none';
            });

            // Configuración mejorada de html2canvas
            const canvas = await html2canvas(content, {
                scale: 2,
                logging: false,
                useCORS: true,
                backgroundColor: '#ffffff',
                windowWidth: content.scrollWidth,
                windowHeight: content.scrollHeight
            });

            // Restaurar los botones
            editButtons.forEach(button => {
                button.style.display = 'inline-flex';
            });

            const imgWidth = 190; // A4 width in mm (210mm - margins)
            const pageHeight = 297; // A4 height in mm
            const imgHeight = canvas.height * imgWidth / canvas.width;

            const pdf = new jsPDF('p', 'mm', 'a4');

            // Agregar encabezado
            pdf.setFontSize(16);
            pdf.text('Detalle de Solicitud', 105, 15, { align: 'center' });

            // Agregar la imagen del contenido
            const imgData = canvas.toDataURL('image/png');

            // Si el contenido es más largo que una página, dividirlo en múltiples páginas
            let heightLeft = imgHeight;
            let position = 25; // Empezar después del encabezado
            let pageData = imgData;

            pdf.addImage(pageData, 'PNG', 10, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = 0;
                pdf.addPage();
                pdf.addImage(pageData, 'PNG', 10, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            // Agregar pie de página en la última página
            pdf.setFontSize(10);
            const fecha = new Date().toLocaleDateString();
            const hora = new Date().toLocaleTimeString();
            pdf.text(`Generado el: ${fecha} ${hora}`, 10, pdf.internal.pageSize.height - 10);

            pdf.save(`Solicitud-${solicitudNumero}.pdf`);
            message.success({ content: 'PDF generado con éxito', key: 'pdfGeneration' });
        } catch (error) {
            console.error('Error al generar PDF:', error);
            message.error({ content: 'Error al generar el PDF', key: 'pdfGeneration' });
        }
    };

    useEffect(() => {
        fetchSolicitudDetalle();
    }, [solicitudNumero]);

    return (
        <Spin spinning={loading}>
            {solicitud && (
                <div>
                    <Space style={{ marginBottom: 16, marginLeft: 20 }}>
                        <Button onClick={() => navigate('/solicitudes')}>Volver</Button>
                        <Button
                            type="primary"
                            icon={<DownloadOutlined />}
                            onClick={generatePDF}
                        >
                            Exportar PDF
                        </Button>
                    </Space>
                    <Card
                        ref={contentRef}
                        title={`Detalle de Solicitud ${solicitud.solicitud_numero}`}
                        style={{ margin: '20px' }}
                    >
                        <Descriptions bordered column={1}>
                            <Descriptions.Item label="Número de Solicitud">
                                {solicitud.solicitud_numero}
                            </Descriptions.Item>
                            <Descriptions.Item label="Detalles">
                                {editingField === 'detalles' ? (
                                    <div>
                                        <Input.TextArea
                                            value={editedValue}
                                            onChange={(e) => setEditedValue(e.target.value)}
                                            rows={3}
                                        />
                                        <Button type="link" onClick={() => handleSave('detalles')}>Guardar</Button>
                                        <Button type="link" onClick={handleCancel}>Cancelar</Button>
                                    </div>
                                ) : (
                                    <div>
                                        {solicitud.detalles || 'No especificado'}{' '}
                                        <Button type="link" onClick={() => handleEdit('detalles', solicitud.detalles)}>
                                            Editar
                                        </Button>
                                    </div>
                                )}
                            </Descriptions.Item>
                            <Descriptions.Item label="Fecha y Hora de Creación">
                                {formatFechaHora(solicitud.fecha_creacion)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Creado Por">
                                {solicitud.creado_por || 'Desconocido'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Técnico Asignado">
                                {editingField === 'tecnico' ? (
                                    <div>
                                        <Select
                                            style={{ width: '100%' }}
                                            value={editedValue}
                                            onChange={(value) => setEditedValue(value)}
                                        >
                                            {tecnicos.map(tecnico => (
                                                <Select.Option
                                                    key={tecnico.correo_electronico}
                                                    value={tecnico.correo_electronico}
                                                >
                                                    {`${tecnico.nombre} ${tecnico.apellido}`}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                        <Button type="link" onClick={() => handleSave('tecnico')}>Guardar</Button>
                                        <Button type="link" onClick={handleCancel}>Cancelar</Button>
                                    </div>
                                ) : (
                                    <div>
                                        {getTecnicoNombre(solicitud.tecnico)}{' '}
                                        <Button type="link" onClick={() => handleEdit('tecnico', solicitud.tecnico)}>
                                            Editar
                                        </Button>
                                    </div>
                                )}
                            </Descriptions.Item>
                            <Descriptions.Item label="Estado">
                                {editingField === 'estado_id' ? (
                                    <div>
                                        <Select
                                            style={{ width: '100%' }}
                                            value={editedValue}
                                            onChange={(value) => setEditedValue(value)}
                                        >
                                            {estados.map(estado => (
                                                <Select.Option key={estado.id} value={estado.id}>
                                                    {estado.descripcion}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                        <Button type="link" onClick={() => handleSave('estado_id')}>Guardar</Button>
                                        <Button type="link" onClick={handleCancel}>Cancelar</Button>
                                    </div>
                                ) : (
                                    <div>
                                        {getEstadoDescripcion(solicitud.estado_id)}{' '}
                                        <Button type="link" onClick={() => handleEdit('estado_id', solicitud.estado_id)}>
                                            Editar
                                        </Button>
                                    </div>
                                )}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                </div>
            )}
        </Spin>
    );
};

export default SolicitudDetalle;