'use strict';
const nodemailer = require('nodemailer');
var config = require('../config').get(process.env.NODE_ENV),
    logger = require('../common/logger').getLogger(),
    errLogger = require('../common/logger').getLogger('userErrLog');

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport(config.email);

// send activation code for registeration
transporter.sendActivationCode = function(toAddress, username, software_name, activation_code){
    let mailOptions = {
        from: config.email.defaultFromAddress, // sender address
        to: toAddress, // receiver address
        subject: software_name + ' Registration', // Subject line
        //text: 'hello world\n', // plain text body
        html: '<p>Dear '+ username + ':</p><br><p>Your ' + software_name + ' registration is almost completed. Please use this code:  <b style="font-size:150%;">' + activation_code + '</b>  to activate your account.</p> <p>Remember this code is only valid for 10 minutes.</p> <p>If you are having difficulties activating it, then please contact us.</p> <br><p>Yours sincerely,</p> <p>Inpiasia</p>' // html body
    };

    // send mail with defined transport object
    return transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            errLogger.error('Email Sending Error:\n' + error)
            return;
        } 
        logger.info('Activation Message sent: %s', info.response);
    });
}

// send password reset verification code for registeration
transporter.sendVerificationCode = function(toAddress, username, software_name, verification_code){
    let mailOptions = {
        from: config.email.defaultFromAddress, // sender address
        to: toAddress, // receiver address
        subject: software_name + ' Password Reset', // Subject line
        //text: 'hello world\n', // plain text body
        html: '<p>Dear '+ username + ':</p><br><p>To reset the password for your ' + software_name + ' account, please type this code:  <b style="font-size:150%;">' + verification_code + '</b>  in the application.</p> <p> Remember this code is only valid for 10 minutes.</p> <p>If you are having difficulties resetting your password, then please contact us.</p> <br><p>Yours sincerely,</p> <p>Inpiasia</p>' , // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            errLogger.error('Email Sending Error:\n' + error)
            return;
        }
        logger.info('Resetting Message sent: %s', info.response);
    });
}

//transporter.sendActivationCode('q.guo@mostechnologies.com', 'Charles Guo', 'KryptoTrace', '123456')
//transporter.sendVerificationCode('q.guo@mostechnologies.com', 'Charles Guo', 'KryptoTrace', '654321')
module.exports = transporter;
