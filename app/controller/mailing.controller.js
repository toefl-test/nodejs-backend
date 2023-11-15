
const nodemailer = require('nodemailer')

module.exports.sendingMail = async({from, to, subject, text}) =>{

    try {
      let mailOptions = ({
        from,
        to,
        subject,
        text
    })
    //asign createTransport method in nodemailer to a variable
    //service: to determine which email platform to use
    //auth contains the senders email and password which are all saved in the .env
    const Transporter = nodemailer.createTransport({
        host: "mail.toefl-test.uz", 
        port: 587,
        secure: false,
        auth: {
          user: process.env.email,
          pass: process.env.emailpassword,
        },
        tls: {
            rejectUnauthorized: false
        }
      });
  
        //return the Transporter variable which has the sendMail method to send the mail
        //which is within the mailOptions
      return await Transporter.sendMail(mailOptions) 
    } catch (error) {
      console.log(error)
    }
      
  }
  