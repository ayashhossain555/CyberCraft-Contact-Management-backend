const express = require('express');
const serverless = require('serverless-http');
const Contact = require('../models/Contact');
const { createContactPDF, createAllContactsPDF } = require('../utilities/pdfGenerator');
const sendEmail = require('../utilities/mailer');

const app = express();
app.use(express.json());


app.get('/api/contacts/download', async (req, res) => {
  try {
    const contacts = await Contact.find({});
    createAllContactsPDF(contacts, async (pdfPath) => {
        res.download(pdfPath, error => {
            if (error) {
                console.error('Download error:', error);
                res.status(500).send('Error downloading the file.');
            } else {
                console.log('File downloaded successfully');
            }
        });
    });
} catch (error) {
        res.status(500).json({ message: 'Failed to generate PDF: ' + error.message });
    }
});

// Get all contacts
app.get('/api/contacts', async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new contact
app.post('/api/contacts', async (req, res) => {
  const contact = new Contact({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    message: req.body.message
  });

  try {
    const newContact = await contact.save();
    createContactPDF(newContact, (pdfPath) => {
        sendEmail({
            from: 'ayash.hossain.chowdhury@gmail.com',
            to: 'test@nusaiba.com.bd',
            subject: 'New Contact Submission',
            text: 'Please find attached the PDF of the new contact submission.',
            attachments: [{ path: pdfPath }]
          });
        res.status(201).json({ contact: newContact, pdfPath });
      });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a contact
app.put('/api/contacts/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const updatedContact = await Contact.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!updatedContact) {
      return res.status(404).json({ message: "No contact found with this ID" });
    }
    createContactPDF(updatedContact, (pdfPath) => {
        sendEmail({
            from: 'your-email@gmail.com',
            to: 'test@nusaiba.com.bd',
            subject: 'Updated Contact Submission',
            text: 'Please find attached the PDF of the new contact submission.',
            attachments: [{ path: pdfPath }]
          });
        res.json({ contact: updatedContact, pdfPath });
      });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a contact
app.delete('/api/contacts/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedContact = await Contact.findByIdAndDelete(id);
    if (!deletedContact) {
      return res.status(404).json({ message: "No contact found with this ID" });
    }
    res.json({ message: "Contact deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = app;
module.exports.handler = serverless(app);