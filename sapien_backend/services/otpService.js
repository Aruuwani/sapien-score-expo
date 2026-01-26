const nodemailer = require('nodemailer');
const generateOtp = require('../utils/generateOtp');
// Twilio and AWS SNS disabled - using email OTP only for password reset
// const AWS = require('aws-sdk');
// AWS.config.update({ region: 'us-east-1' });
// const sns = new AWS.SNS();
const otpStore = new Map();

const sendOtpToEmail = async (email) => {
    const otp = generateOtp();

    // Store OTP with expiration (10 minutes)
    otpStore.set(email, {
        otp,
        expiresAt: Date.now() + 600000 // 10 minutes
    });

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
        subject: 'SapienScore Password Reset Code',
        text: `Your SapienScore password reset verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you did not request a password reset, please ignore this email.`,
    });

    return true;
};

const verifyOtp = (email, otp) => {
    const storedOtpData = otpStore.get(email);

    if (!storedOtpData) {
        return false;
    }

    // Check if OTP has expired
    if (storedOtpData.expiresAt < Date.now()) {
        otpStore.delete(email);
        return false;
    }

    // Verify OTP
    if (storedOtpData.otp === otp) {
        otpStore.delete(email);
        return true;
    }

    return false;
};

// Phone OTP via AWS SNS - DISABLED
// const SenPhoneOtp = async (phoneNumber, otp) => {
//     const message = `Your verification code is: ${otp}`;
//     const params = {
//         Message: message,
//         PhoneNumber: phoneNumber,
//         MessageAttributes: {
//             'AWS.SNS.SMS.SMSType': {
//                 DataType: 'String',
//                 StringValue: 'Transactional',
//             },
//         },
//     };

//     const result = await sns.publish(params).promise();
//     return result.MessageId;
// };

module.exports = { sendOtpToEmail, verifyOtp };
