const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = (options) => {
  transporter.sendMail(options, (error, info) => {
    if (error) {
      return console.log(`Error: ${error}`);
    }
    console.log(`Message Sent: ${info.response}`);
  });
};

module.exports = sendEmail;
