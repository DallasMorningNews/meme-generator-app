module.exports = function (app) {
  // Module requirements
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

  // Our bucket
  const bucketName = 'dmnmemebase';

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
      // Give it a new, unique name based on the time
      key: function (req, file, cb) {
        const now = new Date();
        const timeID = Number(now);
        const newName = `${timeID}.jpg`;
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
    },
  });

  app.post('/admin/upload', upload.array('image', 20), (req, res) => {
    // This is what we'll send back to app
    const returnPayload = [];
    // For each file sent
    req.files.forEach((d) => {
      // Get the file name without teh file type
      const imageid = d.key.slice(0, -4);
      // Create an object to update database with
      d.imageid = imageid;
      d.tags = req.body.tags
      // Append this file name to return payload
      returnPayload.push(imageid);
      // Update database
      req.models.images.create(d, (err) => {
        if (err) { res.send(err); }
      });
    });
    // Send payload back to admin
    res.send(returnPayload);
  });
};
