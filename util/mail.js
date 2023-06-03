const nodemailer = require("nodemailer");
const HttpError = require("../http-error");
let {oAuth2Client} = require("./google-calendar");

const sendConfirmationMail = async (email, link) =>{
    console.log(oAuth2Client);

    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            type: 'OAuth2',
            clientId: oAuth2Client._clientId,
            clientSecret: oAuth2Client._clientSecret,
            refreshToken: oAuth2Client.credentials.refresh_token,
            user: `${process.env.EMAIL_USER}`,
            pass: `${process.env.EMAIL_PASS}`
        } 
    });

    let options = {
        from: `Dario <becurioustutoring@gmail.com>`,
        to: `${email}`,
        subject: "Be Curious - confirm your account",
        html:   `<h4>Be Curious</h4><br />
                <p>STEM Tutoring services by Dario</p><br />
                <p>Confirm your account by clicking on the link below: </p> <br />
                <p>${link}</p>`
    };

   transporter.sendMail(options, (error, info)=>{
        if (error){
            console.log(error);
            return new HttpError("Error sending confirmation email", 500);
        }
        if(info){
            console.log(info.response);
        }
    });


  
}

exports.sendConfirmationMail = sendConfirmationMail;