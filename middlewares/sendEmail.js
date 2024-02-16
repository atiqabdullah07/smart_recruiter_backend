const nodeMailer = require("nodemailer");

exports.sendEmail = async (options) => {

  var transporter = nodeMailer.createTransport({
    service:'gmail',
    auth: {
      user: "uzairchaudhary.30@gmail.com",
      pass: process.env.MAIL_PASS
    }
  });
  

  const mailOptions = {
    from: "Smart Recruiter <no-reply@smartrecruiter.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  //console.log(mailOptions);
  await transporter.sendMail(mailOptions);
};
