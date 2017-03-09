'use strict';

module.exports = (app) => {
  const fs = require('fs');

  var AWS = require('aws-sdk');

  // Get our key and secret key
  AWS.config.update({
    accessKeyId: process.env.S3_KEY,
    secretAccessKey: process.env.S3_SECRET,
  });

  const s3Meme = new AWS.S3();
  const s3Thumb = new AWS.S3();

  app
    // Get first meme from a builder
    .get('/admin/delete/memes/:memeID', (req, res) => {
      const trashMeme = req.params.memeID;
      console.log(trashMeme);
      req.models.memes.find({ date: trashMeme }).remove(() => {
        s3Meme.deleteObject({
          Bucket: 'dmnmeme',
          Key: `${trashMeme}.png`,
        }, (err, data) => {
          if (!err) {
            s3Thumb.deleteObject({
              Bucket: 'dmnmemeresized',
              Key: `${trashMeme}.png`,
            }, (err, data) => {
              if (!err) {
                res.json(data);
              } else {
                res.json(err);
              }
            });
          } else {
            res.json(err);
          }
        });
      });
    });
};
