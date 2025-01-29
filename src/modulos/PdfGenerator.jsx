import { message } from 'antd';
import jsPDF from 'jspdf';
import logo from '../assets/logo.png';

export const generateSolicitudPDF = async ({
    solicitudNumero,
    solicitud,
    getTecnicoNombre,
    getEstadoDescripcion,
    formatFechaHora,
    getCreadorNombre
}) => {
    try {
        message.loading({ content: 'Generando PDF...', key: 'pdfGeneration' });

        // Configuración inicial del PDF
        const pdf = new jsPDF('p', 'mm', 'a4');

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

        // Agregar fondo del encabezado
        pdf.setFillColor(240, 240, 240);
        pdf.rect(0, 0, 210, 60, 'F');

        // Agregar logo
        if (logoBase64) {
            try {
                pdf.addImage(logoBase64, 'PNG', 10, 10, 40, 40);
            } catch (error) {
                console.error('Error al agregar el logo:', error);
            }
        }

        // Título con número de OT
        pdf.setFontSize(24);
        pdf.setTextColor(44, 62, 80);
        pdf.text(`ORDEN DE TRABAJO`, 105, 25, { align: 'center' });
        pdf.setFontSize(20);
        pdf.text(`N° ${solicitudNumero}`, 105, 40, { align: 'center' });

        // Configuración de la tabla
        let yPos = 70;
        const lineHeight = 12;
        const colWidth = [50, 130];
        const leftMargin = 15;

        // Encabezados de la tabla
        pdf.setFillColor(52, 73, 94);
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(12);
        pdf.rect(10, yPos, 190, lineHeight, 'F');
        pdf.text('Campo', leftMargin, yPos + 8);
        pdf.text('Información', leftMargin + colWidth[0], yPos + 8);
        yPos += lineHeight;

        // Datos de la tabla
        const data = [
            ['Detalles', solicitud.detalles || 'No especificado'],
            ['Fecha Creación', formatFechaHora(solicitud.fecha_creacion)],
            ['Creado Por', getCreadorNombre(solicitud.creado_por)],
            ['Técnico Asignado', getTecnicoNombre(solicitud.tecnico)],
            ['Estado', getEstadoDescripcion(solicitud.estado_id)]
        ];

        // Dibujar filas de la tabla
        data.forEach((row, i) => {
            pdf.setFillColor(i % 2 === 0 ? 245 : 255);
            pdf.rect(10, yPos, 190, lineHeight, 'F');

            pdf.setTextColor(0);
            pdf.setFontSize(11);

            const maxWidth = colWidth[1] - 10;
            const lines1 = pdf.splitTextToSize(row[0], colWidth[0] - 5);
            const lines2 = pdf.splitTextToSize(row[1], maxWidth);

            const maxLines = Math.max(lines1.length, lines2.length);
            const rowHeight = maxLines * lineHeight;

            pdf.rect(10, yPos, 190, rowHeight, 'F');
            pdf.text(lines1, leftMargin, yPos + 8);
            pdf.text(lines2, leftMargin + colWidth[0], yPos + 8);

            yPos += rowHeight;
        });

        // Pie de página
        pdf.setFontSize(10);
        pdf.setTextColor(128, 128, 128);
        pdf.text('Maigas Comercial S.A. - Servicio Técnico', 105, 280, { align: 'center' });

        const fechaGeneracion = new Date().toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        pdf.setFontSize(8);
        pdf.text(`Generado el: ${fechaGeneracion}`, 105, 287, { align: 'center' });

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