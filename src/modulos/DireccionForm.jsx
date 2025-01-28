import React, { useState, useEffect, useCallback } from 'react';
import { Form, Input, Select, Button, Switch, Space, Row, Col, message, Alert } from 'antd';
import { SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { debounce } from 'lodash';
import axios from 'axios';

const { Option } = Select;

const TIPOS_DIRECCION = [
    { value: 'Casa', label: 'Casa' },
    { value: 'Trabajo', label: 'Trabajo' },
    { value: 'Oficina', label: 'Oficina' },
    { value: 'Otro', label: 'Otro' }
];

const REGIONES_CHILE = [
    'Arica y Parinacota',
    'Tarapacá',
    'Antofagasta',
    'Atacama',
    'Coquimbo',
    'Valparaíso',
    'Metropolitana de Santiago',
    'Libertador General Bernardo O\'Higgins',
    'Maule',
    'Ñuble',
    'Biobío',
    'La Araucanía',
    'Los Ríos',
    'Los Lagos',
    'Aysén',
    'Magallanes'
].sort();

const DireccionForm = ({
    direccion,
    clienteCodigo,
    onClose,
    onSave,
    esPrimeraDireccion
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (direccion) {
            form.setFieldsValue({
                ...direccion,
                es_principal: direccion.es_principal || esPrimeraDireccion
            });
        } else {
            form.resetFields();
            form.setFieldsValue({
                pais: 'Chile',
                tipo_direccion: 'Casa',
                es_principal: esPrimeraDireccion
            });
        }
    }, [direccion, form, esPrimeraDireccion]);

    const validateCoordinates = (lat, lng) => {
        if (!lat || !lng) return true;
        return !isNaN(lat) && !isNaN(lng) &&
            lat >= -90 && lat <= 90 &&
            lng >= -180 && lng <= 180;
    };

    const handleSubmit = async (values) => {
        try {
            setLoading(true);
            setError(null);

            // Validar coordenadas si existen
            if (values.latitud && values.longitud) {
                if (!validateCoordinates(values.latitud, values.longitud)) {
                    throw new Error('Coordenadas geográficas inválidas');
                }
            }

            const token = localStorage.getItem('token');
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            // Construir dirección completa
            values.direccion_completa = `${values.direccion} ${values.numero}${values.depto_oficina ? `, ${values.depto_oficina}` : ''
                }, ${values.comuna}, ${values.ciudad}, ${values.region}, Chile`;

            if (direccion) {
                await axios.put(
                    `${import.meta.env.VITE_BACKEND_URL}/direcciones/${direccion.id}`,
                    values,
                    config
                );
                message.success('Dirección actualizada exitosamente');
            } else {
                await axios.post(
                    `${import.meta.env.VITE_BACKEND_URL}/direcciones`,
                    {
                        ...values,
                        cliente_codigo: clienteCodigo
                    },
                    config
                );
                message.success('Dirección creada exitosamente');
            }

            onSave?.();
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.message || 'Error al guardar la dirección';
            setError(errorMsg);
            message.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // Validar al escribir
    const validateForm = useCallback(
        debounce(async () => {
            try {
                await form.validateFields();
                setError(null);
            } catch (err) {
                // Solo validación, no mostrar error
            }
        }, 500),
        [form]
    );

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            onValuesChange={validateForm}
            initialValues={{
                pais: 'Chile',
                tipo_direccion: 'Casa',
                es_principal: esPrimeraDireccion
            }}
        >
            {error && (
                <Alert
                    message="Error"
                    description={error}
                    type="error"
                    showIcon
                    closable
                    style={{ marginBottom: 16 }}
                />
            )}

            <Row gutter={16}>
                <Col span={16}>
                    <Form.Item
                        name="direccion"
                        label="Dirección"
                        rules={[{ required: true, message: 'Por favor ingrese la dirección' }]}
                        tooltip="Ingrese el nombre de la calle"
                    >
                        <Input
                            placeholder="Ej: Av. Providencia"
                            maxLength={100}
                        />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        name="numero"
                        label="Número"
                        rules={[{ required: true, message: 'Por favor ingrese el número' }]}
                    >
                        <Input placeholder="Ej: 123" maxLength={10} />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item
                        name="depto_oficina"
                        label="Departamento/Oficina"
                    >
                        <Input
                            placeholder="Ej: Depto 42"
                            maxLength={50}
                        />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        name="tipo_direccion"
                        label="Tipo de Dirección"
                        rules={[{ required: true, message: 'Por favor seleccione el tipo' }]}
                    >
                        <Select>
                            {TIPOS_DIRECCION.map(tipo => (
                                <Option key={tipo.value} value={tipo.value}>
                                    {tipo.label}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={8}>
                    <Form.Item
                        name="comuna"
                        label="Comuna"
                        rules={[{ required: true, message: 'Por favor ingrese la comuna' }]}
                    >
                        <Input placeholder="Comuna" maxLength={50} />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        name="ciudad"
                        label="Ciudad"
                        rules={[{ required: true, message: 'Por favor ingrese la ciudad' }]}
                    >
                        <Input placeholder="Ciudad" maxLength={50} />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        name="region"
                        label="Región"
                        rules={[{ required: true, message: 'Por favor seleccione la región' }]}
                    >
                        <Select
                            showSearch
                            placeholder="Seleccione una región"
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                        >
                            {REGIONES_CHILE.map(region => (
                                <Option key={region} value={region}>
                                    {region}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item
                        name="codigo_postal"
                        label="Código Postal"
                    >
                        <Input
                            placeholder="Código Postal"
                            maxLength={10}
                        />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        name="pais"
                        label="País"
                    >
                        <Input disabled />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item
                        name="latitud"
                        label="Latitud"
                        rules={[
                            {
                                validator: async (_, value) => {
                                    if (value && !validateCoordinates(value, 0)) {
                                        throw new Error('Latitud inválida');
                                    }
                                }
                            }
                        ]}
                    >
                        <Input placeholder="Ej: -33.4489" />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        name="longitud"
                        label="Longitud"
                        rules={[
                            {
                                validator: async (_, value) => {
                                    if (value && !validateCoordinates(0, value)) {
                                        throw new Error('Longitud inválida');
                                    }
                                }
                            }
                        ]}
                    >
                        <Input placeholder="Ej: -70.6693" />
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item
                name="referencia"
                label="Referencia"
            >
                <Input.TextArea
                    placeholder="Indicaciones adicionales para encontrar la dirección"
                    rows={3}
                    maxLength={500}
                    showCount
                />
            </Form.Item>

            <Form.Item
                name="es_principal"
                valuePropName="checked"
            >
                <Switch
                    checkedChildren="Dirección Principal"
                    unCheckedChildren="Dirección Secundaria"
                    disabled={esPrimeraDireccion}
                />
            </Form.Item>

            <Form.Item>
                <Space>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        icon={<SaveOutlined />}
                    >
                        {direccion ? 'Actualizar' : 'Crear'}
                    </Button>
                    <Button
                        onClick={onClose}
                        icon={<CloseOutlined />}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                </Space>
            </Form.Item>
        </Form>
    );
};

export default DireccionForm;