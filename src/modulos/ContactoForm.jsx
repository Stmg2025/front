import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Switch, Space, Row, Col, message } from 'antd';
import axios from 'axios';

const ContactoForm = ({ contacto, clienteCodigo, onClose, onSave, esPrimerContacto }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (contacto) {
            form.setFieldsValue(contacto);
        } else {
            form.resetFields();
            if (esPrimerContacto) {
                form.setFieldsValue({ es_principal: true });
            }
        }
    }, [contacto, form, esPrimerContacto]);

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (contacto) {
                await axios.put(
                    `${import.meta.env.VITE_BACKEND_URL}/contactos/${contacto.id}`,
                    values,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );
                message.success('Contacto actualizado exitosamente');
            } else {
                await axios.post(
                    `${import.meta.env.VITE_BACKEND_URL}/contactos`,
                    {
                        ...values,
                        cliente_codigo: clienteCodigo
                    },
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );
                message.success('Contacto creado exitosamente');
            }
            onSave();
        } catch (error) {
            console.error('Error:', error);
            message.error('Error al guardar el contacto');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
                es_principal: esPrimerContacto
            }}
        >
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item
                        name="nombre"
                        label="Nombre"
                        rules={[{ required: true, message: 'Por favor ingrese el nombre' }]}
                    >
                        <Input placeholder="Nombre del contacto" maxLength={255} />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        name="apellido"
                        label="Apellido"
                    >
                        <Input placeholder="Apellido del contacto" maxLength={255} />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item
                        name="cargo"
                        label="Cargo"
                    >
                        <Input placeholder="Cargo en la empresa" maxLength={100} />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        name="departamento"
                        label="Departamento"
                    >
                        <Input placeholder="Departamento" maxLength={100} />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item
                        name="telefono"
                        label="Teléfono"
                    >
                        <Input placeholder="Teléfono de contacto" />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        name="extension"
                        label="Extensión"
                    >
                        <Input placeholder="Extensión telefónica" maxLength={20} />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            {
                                type: 'email',
                                message: 'Email inválido',
                            }
                        ]}
                    >
                        <Input placeholder="Correo electrónico" maxLength={255} />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        name="rut"
                        label="RUT"
                    >
                        <Input placeholder="RUT del contacto" />
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item
                name="observaciones"
                label="Observaciones"
            >
                <Input.TextArea
                    placeholder="Observaciones adicionales"
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
                    checkedChildren="Contacto Principal"
                    unCheckedChildren="Contacto Secundario"
                    disabled={esPrimerContacto}
                />
            </Form.Item>

            <Form.Item>
                <Space>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        {contacto ? 'Actualizar' : 'Crear'}
                    </Button>
                    <Button onClick={onClose}>
                        Cancelar
                    </Button>
                </Space>
            </Form.Item>
        </Form>
    );
};

export default ContactoForm;