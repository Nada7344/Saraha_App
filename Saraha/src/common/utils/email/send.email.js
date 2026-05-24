import nodemailer from "nodemailer";
import { EMAIL, EMAIL_APP_PASSWORD ,APPLICATION_NAME } from "../../../../config/config.service.js";

export const sendEmail =async({
    to,
    cc,
    bcc,
    subject,
    html,
    attachments=[]
}={})=>{

const transporter = nodemailer.createTransport({
  service :"gmail",
  auth: {
    user:EMAIL,
    pass: EMAIL_APP_PASSWORD,
  },
});


try {
  const info = await transporter.sendMail({
    from: `${APPLICATION_NAME} <${EMAIL}>`, // sender address
    to,
    cc,
    bcc,
    html,
    subject,
    attachments
  });

  console.log("Message sent: %s", info.messageId);
  
} catch (err) {
  console.error("Error while sending mail:", err);
}

}