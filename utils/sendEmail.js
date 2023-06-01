const nodemailer = require("nodemailer")
const sendEmail = async (subject, message, send_to, send_from, reply_to) => {

    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
            user: 'lbeyalella55@gmail.com',
            pass: 'tzulilprfpymlkme'
        },
    })

    const options = {
        from: send_from,
        to: send_to,
        replyTo: reply_to,
        subject: subject,
        html: message
    }

    //send email
    transporter.sendMail(options, function(err, info) {
        if (err) {
            console.log(err) 
        } else {
            console.log(info)
        }
    }) 
};

module.exports = sendEmail; 