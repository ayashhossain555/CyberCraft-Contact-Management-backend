const express = require('express');
const serverless = require('serverless-http');
const Contact = require('./models/Contact');
const cors = require('cors');
require('dotenv').config();
const { createContactPDF, createAllContactsPDF } = require('./utilities/pdfGenerator');
const sendEmail = require('./utilities/mailer');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection Setup
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB connected successfully"))
  .catch(err => console.log("MongoDB connection error:", err));

app.use(cors());

// Endpoint to download all contacts as PDF
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
            from: 'your-email@gmail.com',
            to: 'recipient-email@example.com',
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
            to: 'recipient-email@example.com',
            subject: 'Updated Contact Submission',
            text: 'Please find attached the PDF of the updated contact submission.',
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
