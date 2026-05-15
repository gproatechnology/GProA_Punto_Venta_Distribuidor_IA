/**
 * GProA - Exporter Utility
 * backend/utils/exporter.js
 * 
 * Utilidad para exportar datos a CSV, Excel y PDF
 */

const logger = require('./logger');

// Exportar a CSV
const exportToCSV = (data, filename = 'export') => {
    if (!data || data.length === 0) {
        throw new Error('No hay datos para exportar');
    }

    const headers = Object.keys(data[0]);
    const csvRows = [];

    // Headers
    csvRows.push(headers.join(','));

    // Datos
    data.forEach(row => {
        const values = headers.map(header => {
            const value = row[header];
            // Escapar comas y comillas
            const escaped = String(value ?? '').replace(/"/g, '""');
            return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
    });

    const csvContent = csvRows.join('\n');
    
    return {
        filename: `${filename}_${Date.now()}.csv`,
        content: csvContent,
        mimeType: 'text/csv'
    };
};

// Exportar a Excel (formato básico - CSV con BOM para Excel)
const exportToExcel = (data, filename = 'export') => {
    if (!data || data.length === 0) {
        throw new Error('No hay datos para exportar');
    }

    const headers = Object.keys(data[0]);
    const rows = [];

    // Headers
    rows.push(headers.join('\t'));

    // Datos
    data.forEach(row => {
        const values = headers.map(header => {
            const value = row[header];
            return String(value ?? '');
        });
        rows.push(values.join('\t'));
    });

    // Agregar BOM para Excel reconozca UTF-8
    const content = '\ufeff' + rows.join('\n');
    
    return {
        filename: `${filename}_${Date.now()}.xls`,
        content: content,
        mimeType: 'application/vnd.ms-excel'
    };
};

// Exportar a PDF (generar HTML simple para impresión)
const exportToPDF = (data, options = {}) => {
    if (!data || data.length === 0) {
        throw new Error('No hay datos para exportar');
    }

    const { title = 'Reporte', subtitle = '' } = options;
    const headers = Object.keys(data[0]);

    // Generar HTML
    let html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        h1 { color: #333; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f5f5f5; }
        .footer { margin-top: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <h1>${title}</h1>
    ${subtitle ? `<p>${subtitle}</p>` : ''}
    <table>
        <thead>
            <tr>
                ${headers.map(h => `<th>${h}</th>`).join('')}
            </tr>
        </thead>
        <tbody>
            ${data.map(row => `
                <tr>
                    ${headers.map(h => `<td>${row[h] ?? ''}</td>`).join('')}
                </tr>
            `).join('')}
        </tbody>
    </table>
    <div class="footer">
        <p>Generado: ${new Date().toLocaleString()}</p>
    </div>
</body>
</html>
    `;

    return {
        filename: `${filename}_${Date.now()}.html`,
        content: html,
        mimeType: 'text/html'
    };
};

// Exportar según formato
const exportData = (data, format, options = {}) => {
    const { filename = 'export' } = options;

    switch (format.toLowerCase()) {
        case 'csv':
            return exportToCSV(data, filename);
        case 'excel':
        case 'xlsx':
            return exportToExcel(data, filename);
        case 'pdf':
            return exportToPDF(data, options);
        default:
            throw new Error(`Formato no soportado: ${format}`);
    }
};

// Transformar datos de MongoDB para exportación
const transformForExport = (documents, fieldMappings = {}) => {
    return documents.map(doc => {
        const transformed = {};
        
        Object.keys(fieldMappings).forEach(key => {
            const mapping = fieldMappings[key];
            const value = doc[key];
            
            if (typeof mapping === 'function') {
                transformed[mapping(key, doc)] = value;
            } else {
                transformed[mapping] = value;
            }
        });
        
        return transformed;
    });
};

module.exports = {
    exportToCSV,
    exportToExcel,
    exportToPDF,
    exportData,
    transformForExport
};