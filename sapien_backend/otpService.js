const nodemailer = require('nodemailer');
const generateOtp = require('../utils/generateOtp'); 
const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });
const sns = new AWS.SNS();
const otpStore = new Map(); 

const sendOtpToEmail = async (email) => {
    const otp = generateOtp();
    otpStore.set(email, otp);

    const transporter = nodemailer.createTransport({
        pool: true, 
    maxConnections: 5,
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'SapienScore Login OTP Code',
        text: `Your SapienScore Login OTP Code is: ${otp}`,
    });

    return true;
};

const verifyOtp = (email, otp) => {
    const storedOtp = otpStore.get(email);
    if (storedOtp && storedOtp === otp) {
        otpStore.delete(email);
        return true;
    }
    return false;
};

const SenPhoneOtp = async (phoneNumber, otp) => {
    const message = `Your verification code is: ${otp}`;
    const params = {
        Message: message,
        PhoneNumber: phoneNumber,
        MessageAttributes: {
            'AWS.SNS.SMS.SMSType': {
                DataType: 'String',
                StringValue: 'Transactional',
            },
        },
    };

    const result = await sns.publish(params).promise();
    return result.MessageId;
};
module.exports = { sendOtpToEmail, verifyOtp, SenPhoneOtp };
