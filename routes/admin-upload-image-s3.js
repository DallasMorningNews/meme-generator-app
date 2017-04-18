'use strict';

module.exports = function (app) {
  const AWS = require('aws-sdk');
  const multer = require('multer');
  const multerS3 = require('multer-s3');

  // Get our key and secret key
  AWS.config.update({
    accessKeyId: process.env.S3_KEY,
    secretAccessKey: process.env.S3_SECRET,
  });

  // Create an S3 client
  const s3 = new AWS.S3();

  // Payload for database
  let imageObj = {};

  // Our bucket
  const bucketName = "dmnmemebase";

  // Multer S3 file upload function
  const upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: bucketName,
      acl: 'public-read',
      metadata: function (req, file, cb) {
        console.log(file);
        cb(null, { fieldName: file.originalname });
      },
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: function (req, file, cb) {
        imageObj = {};
        const now = new Date();
        const timeID = Number(now);
        const newName = `${timeID}.jpg`;
        imageObj.imageid = timeID;
        cb(null, newName);
      },
    }),
    // Limit size to 200Kb
    limits: { fileSize: 200000 },
    // Limit file type to jpg
    fileFilter: function (req, file, cb) {
      if (!file.originalname.match(/\.(jpg|jpeg)$/)) {
        return cb(new Error('Only jpegs are allowed!'));
      }
      cb(null, true);
    }
  });

  app.post('/admin/upload', upload.single('image'), (req, res, next) => {
    imageObj.tags = req.body.tags;
    console.log('INCOMING...');
    console.log(imageObj);
    req.models.images.create(imageObj, (err) => {
      if (err) {
        console.log('ERROR...');
        console.log(err);
        // Send error
        res.send(err);
      } else {
        console.log('SUCCESS...');
        console.log('Database updated successfully');
        console.log(imageObj);
        res.send(imageObj);
      }
    });
  });
};
