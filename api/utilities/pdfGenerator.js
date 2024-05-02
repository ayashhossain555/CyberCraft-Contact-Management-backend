const PDFDocument = require('pdfkit');
const fs = require('fs');

function createContactPDF(contactData, callback) {
    const doc = new PDFDocument();
    const filename = `Contact-${contactData._id}-${Date.now()}.pdf`;
    const filePath = `/tmp/${filename}`; 

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);
    
    doc.fontSize(16).text('Contact Information', { underline: true });
    doc.fontSize(12).text(`Name: ${contactData.name}`, { continued: true })
        .text(` (Email: ${contactData.email})`, { underline: false, align: 'right' });
    doc.text(`Phone: ${contactData.phone}`);
    doc.text(`Message: ${contactData.message}`, { lineGap: 4, paragraphGap: 5 });

    doc.end();

    stream.on('finish', () => callback(filePath));
}

function createAllContactsPDF(contacts, callback) {
    return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const filename = `All-Contacts-${Date.now()}.pdf`;
    const filePath = `./output/${filename}`;

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(16).text('All Contacts', { underline: true });
    contacts.forEach(contact => {
        doc.moveDown().fontSize(12);
        doc.text(`Name: ${contact.name}`, { continued: true })
            .text(` (Email: ${contact.email})`, { underline: false, align: 'right' });
        doc.text(`Phone: ${contact.phone}`);
        doc.text(`Message: ${contact.message}`, { lineGap: 4, paragraphGap: 5 });
    });

    doc.end();

    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
    });
}
module.exports = { createContactPDF, createAllContactsPDF };
