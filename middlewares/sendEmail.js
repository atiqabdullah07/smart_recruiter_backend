const nodeMailer = require("nodemailer");

exports.sendEmail = async (options) => {
  console.log(options)
  
  var transpoter = nodeMailer.createTransport({
    host:process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    }
  });

  const mailOptions = {
    from: "Smart Recruiter <no-reply@smartrecruiter.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transpoter.sendMail(mailOptions);
};
