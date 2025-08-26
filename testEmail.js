const nodemailer = require('nodemailer');

async function testEmail() {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'doflamingogoes@gmail.com', // apna Gmail
      pass: 'gpdoieaufkixrfsu', // Gmail App Password
    },
  });

  try {
    await transporter.verify();
    console.log('Connected to email server');
  } catch (err) {
    console.error('Unable to connect to email server:', err);
  }
}

testEmail();
