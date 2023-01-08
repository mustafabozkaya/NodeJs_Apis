const nodemailer = require('nodemailer');

const sendEmail = async options => {
    //1-) create Transpoter
    const transpoter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    // 2-) Define Email Options 
    const mailOptions = {
        from: 'Arslan REHMAN <arslan.rehman@epikrobotik.com>',
        to: options.email,
        subject: options.subject,
        text: options.text,
        html: options.html
    };
    // 3-) send the email
    await transpoter.sendMail(mailOptions);
};
module.exports = sendEmail;


// EMAIL_HOST=smtp.mailtrap.io
// EMAIL_USERNAME=2f754facb04028
// EMAIL_PORT=25
// EMAIL_PASSWORD=18c0d1488a9ddd