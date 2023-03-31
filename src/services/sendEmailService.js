import nodemailer from 'nodemailer';
import ErrorHelpers from '../helpers/errorHelpers';
import CONFIG from '../config';
export default {
    sendGmail: async param => {
        let finnalyResult;

        console.log("param---",param)
        const {emailTo,emailCc,emailBcc,subject,sendTypeMail,body,attachments} = param
        
        try {
            const transporter = nodemailer.createTransport({
                host: CONFIG['MAIL_HOST'],
                port: CONFIG['MAIL_PORT'],
                auth: {
                    user: CONFIG['MAIL_ACCOUNT'],
                    pass: CONFIG['MAIL_PASSWORD']
                }
            });

            if(sendTypeMail==='text')
            {
                await transporter.sendMail({
                    from: CONFIG['MAIL_ACCOUNT'],
                    to: emailTo,
                    cc: emailCc,
                    bcc: emailBcc,
                    subject: subject,
                    text: body,
                    attachments:attachments
                    // attachments:[
                    //     {   // use URL as an attachment
                    //         filename: 'license.txt',
                    //         path: 'https://raw.github.com/nodemailer/nodemailer/master/LICENSE'
                    //     }
                    // ]
                },
                (error, info) => {
                    if (error) {
                        console.log("email error",error);
                        finnalyResult = {success:true}
                    }
                    else{
                        console.log('Message %s sent: %s', info.messageId, info.response);
                        finnalyResult = {success:false}
                    }
                }
                );
    
            }
            else
            {
                await transporter.sendMail(
                    {
                    from: CONFIG['MAIL_ACCOUNT'],
                    to: emailTo,
                    cc: emailCc,
                    bcc: emailBcc,
                    subject: subject,
                    html: body,
                    attachments:attachments
                    },
                    (error, info) => {
                        if (error) {
                            console.log("email error",error);
                            finnalyResult = {success:true}
                        }
                        else{
                            console.log('Message %s sent: %s', info.messageId, info.response);
                            finnalyResult = {success:false}
                        }
                    }
                );
    
            }
            
        } 
        catch (error) {
            // console.log("error: ", error)
            ErrorHelpers.errorThrow(error, 'getInfoError', 'UserServices');
        }
          
      return finnalyResult;
    }
}