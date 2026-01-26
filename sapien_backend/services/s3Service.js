// services/s3Service.js
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Configure S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const uploadFileToS3 = async (file) => {
  console.log('file', file)
  const fileExtension = path.extname(file.originalname);
  const uniqueFileName = `${uuidv4()}${fileExtension}`;

  const uploadParams = {
    Bucket: process.env.AWS_BUCKET,
    Key: uniqueFileName,
    Body: file.buffer,
    ContentType: file.mimetype,

  };

  const command = new PutObjectCommand(uploadParams);
  await s3Client.send(command);

  const publicUrl = `${process.env.AWS_PUBLICURL}${uniqueFileName}`;
  return publicUrl;
};

module.exports = { uploadFileToS3 };
