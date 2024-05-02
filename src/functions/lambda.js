const serverless = require('serverless-http');
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected successfully"))
  .catch(err => console.log("MongoDB connection error: ", err));

// Import Routes
const contactRoutes = require('./api/contacts');
app.use('/api', contactRoutes);

// Export the server as a Lambda function
module.exports.handler = serverless(app);
