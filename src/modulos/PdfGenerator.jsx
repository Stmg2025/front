import { message } from 'antd';
import { jsPDF } from 'jspdf';
import logo from '../assets/logo.png';

export const generateSolicitudPDF = async ({
    solicitudNumero,
    solicitud,
    getTecnicoNombre,
    getEstadoDescripcion,
    formatFechaHora,
    getClienteNombre,
    getDireccionDescripcion,
    getContactoNombre
}) => {
    try {
        message.loading({ content: 'Generando PDF...', key: 'pdfGeneration' });

        // Configuración inicial del PDF
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.width;
        const pageHeight = pdf.internal.pageSize.height;
        const margin = 20;
        const lineHeight = 8;
        const columnWidth = (pageWidth - (2 * margin)) / 2;

        // Convertir logo a base64
        const logoBase64 = await new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            };
            img.src = logo;
        });

        // Función helper para agregar secciones con título
        const addSection = (title, yPosition) => {
            pdf.setFillColor(52, 73, 94);
            pdf.setTextColor(255, 255, 255);
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(12);

            // Franja de título
            pdf.rect(margin, yPosition, pageWidth - (2 * margin), 8, 'F');
            pdf.text(title, margin + 2, yPosition + 5.5);

            return yPosition + 12; // Retorna la siguiente posición Y
        };

        // Función helper para agregar campos
        const addField = (label, value, x, y, maxWidth) => {
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(60, 60, 60);
            pdf.text(label + ':', x, y);

            pdf.setFont('helvetica', 'normal');
            const valueText = value || 'No especificado';
            const splitValue = pdf.splitTextToSize(valueText, maxWidth - 40);
            pdf.text(splitValue, x + 35, y);

            return y + (splitValue.length * lineHeight);
        };

        // Encabezado con fondo gris claro
        pdf.setFillColor(240, 240, 240);
        pdf.rect(0, 0, pageWidth, 45, 'F');

        // Agregar logo
        if (logoBase64) {
            pdf.addImage(logoBase64, 'PNG', margin, 7, 25, 25);
        }

        // Título y número de OT
        pdf.setTextColor(44, 62, 80);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(22);
        pdf.text('ORDEN DE TRABAJO', pageWidth / 2, 20, { align: 'center' });
        pdf.setFontSize(18);
        pdf.text(`N° ${solicitudNumero}`, pageWidth / 2, 32, { align: 'center' });

        let yPos = 55;

        // Sección de información del cliente
        yPos = addSection('INFORMACIÓN DEL CLIENTE', yPos);
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(10);

        yPos = addField('Cliente', getClienteNombre(solicitud.cliente_codigo), margin, yPos + 5, pageWidth - (2 * margin));
        yPos = addField('Dirección', getDireccionDescripcion(solicitud.direccion_id), margin, yPos + 3, pageWidth - (2 * margin));
        yPos = addField('Contacto', getContactoNombre(solicitud.contacto_id), margin, yPos + 3, pageWidth - (2 * margin));

        yPos += 5;

        // Sección de información técnica y administrativa
        yPos = addSection('DETALLES DE LA SOLICITUD', yPos);
        yPos += 5;

        // Cuadros de información
        pdf.setFillColor(248, 249, 250);
        pdf.rect(margin, yPos, columnWidth - 5, 45, 'F');
        pdf.rect(margin + columnWidth + 5, yPos, columnWidth - 5, 45, 'F');

        // Información técnica
        pdf.setTextColor(44, 62, 80);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.text('Información Técnica', margin + 2, yPos + 6);

        let infoY = yPos + 15;
        pdf.setFontSize(10);
        infoY = addField('Técnico', getTecnicoNombre(solicitud.tecnico), margin + 2, infoY, columnWidth - 7);
        infoY = addField('Estado', getEstadoDescripcion(solicitud.estado_id), margin + 2, infoY + 3, columnWidth - 7);
        infoY = addField('Fecha', formatFechaHora(solicitud.fecha_creacion), margin + 2, infoY + 3, columnWidth - 7);

        // Información administrativa
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.text('Información Administrativa', margin + columnWidth + 7, yPos + 6);

        infoY = yPos + 15;
        pdf.setFontSize(10);
        infoY = addField('Creado por', solicitud.creado_por, margin + columnWidth + 7, infoY, columnWidth - 7);

        yPos += 55;

        // Sección de descripción
        yPos = addSection('DESCRIPCIÓN', yPos);

        // Agregar cuadro para la descripción
        pdf.setFillColor(248, 249, 250);
        pdf.rect(margin, yPos + 5, pageWidth - (2 * margin), 50, 'F');

        // Agregar texto de descripción
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        const splitDetalles = pdf.splitTextToSize(
            solicitud.detalles || 'Sin detalles especificados',
            pageWidth - (2 * margin) - 10
        );
        pdf.text(splitDetalles, margin + 5, yPos + 15);

        // Pie de página
        pdf.setFillColor(248, 249, 250);
        pdf.rect(0, pageHeight - 25, pageWidth, 25, 'F');

        pdf.setTextColor(128, 128, 128);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        const footerText = 'Maigas Comercial S.A. - Servicio Técnico';
        pdf.text(footerText, pageWidth / 2, pageHeight - 15, { align: 'center' });

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        const fechaGeneracion = new Date().toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        pdf.text(`Documento generado el: ${fechaGeneracion}`, pageWidth / 2, pageHeight - 8, { align: 'center' });

        // Guardar PDF
        pdf.save(`OT-${solicitudNumero}.pdf`);
        message.success({ content: 'PDF generado con éxito', key: 'pdfGeneration' });

        return true;
    } catch (error) {
        console.error('Error al generar PDF:', error);
        message.error({ content: 'Error al generar el PDF', key: 'pdfGeneration' });
        return false;
    }
};