'use strict';

module.exports = (app) => {

  var AWS = require('aws-sdk');

  // Get our key and secret key
  AWS.config.update({
    accessKeyId: process.env.S3_KEY,
    secretAccessKey: process.env.S3_SECRET,
  });

  // Create an S3 client
  const s3 = new AWS.S3({ params: { Bucket: 'dmnmeme' } });

  // UPLOAD FILES
  app.post('/builder/upload', (req, res) => {
    console.log('Uploading meme to S3...');

    // Payload object
    const incomingPayload = req.body;
    console.log(incomingPayload);
    const canvas = new Buffer(incomingPayload.canvas.replace(/^data:image\/\w+;base64,/, ''), 'base64');

    // Name the file by timestamp
    const now = new Date();
    const timeID = Number(now);
    const newName = `${timeID}.png`;

    // Add name to imageobj
    incomingPayload.imagename = newName;

    const data = {
      Key: newName,
      Body: canvas,
      ContentEncoding: 'base64',
      ContentType: 'image/png',
    };

    s3.putObject(data, function(err1, data){
      if (err1) {
        console.log(err1);
        console.log('Error uploading data: ', data);
      } else {
        console.log(`succesfully uploaded the ${newName}!`);
        // Construct an object to use for updating database
        const outgoingPayload = {};
        outgoingPayload.imagename = newName;
        outgoingPayload.builder = incomingPayload.builder;
        outgoingPayload.date = timeID;
        outgoingPayload.tags = incomingPayload.tags;
        outgoingPayload.top = incomingPayload.top;
        outgoingPayload.bottom = incomingPayload.bottom;

        console.log(outgoingPayload);

        // Update table
        req.models.memes.create(outgoingPayload, (err2) => {
          if (err2) {
            // Send error
            res.send(err2);
          } else {
            // Success
            console.log('Meme database updated successfully');
            res.send('ok');
          }
        });
      }
    });
  });
};


  //
  //
  // // UPLOAD FILES
  // app.post('/builder/upload/s3', (req, res) => {
  //   console.log("I'm in here.");
  //
  //   const incomingPayload = req.body;
  //   const canvas = incomingPayload.canvas.replace(/^data:image\/\w+;base64,/, '');
  //   const buf = new Buffer(canvas, 'base64');
  //   // Set name as time
  //   const now = new Date();
  //   const timeID = Number(now);
  //   const newName = `${timeID}.png`;
  //   // Add name to imageobj
  //   incomingPayload.imagename = newName;
  //   // Write original to file
  //   fs.writeFile(`public/images/meme-images/${newName}`, buf);
  //   // Open original to convert to thumb
  //   lwip.open(`public/images/meme-images/${newName}`, (err, image) => {
  //     if (err) {
  //       console.log(err);
  //     } else {
  //       image.batch()
  //         .scale(0.16)
  //         .writeFile(`public/images/meme-images/thumbs/${newName}`, (error) => {
  //           if (error) {
  //             console.log(`Error writing meme thumbnail image: ${error}`);
  //           } else {
  //             console.log('Meme thumbnail completed successfully');
  //           }
  //         });
  //     }
  //   });
  //
  //   // Construct an object to use for updating database
  //   const outgoingPayload = {};
  //   outgoingPayload.imagename = newName;
  //   outgoingPayload.builder = incomingPayload.builder;
  //   outgoingPayload.date = timeID;
  //   outgoingPayload.tags = incomingPayload.tags;
  //   outgoingPayload.top = incomingPayload.top;
  //   outgoingPayload.bottom = incomingPayload.bottom;
  //
  //   console.log(outgoingPayload);
  //
  //   // Update table
  //   req.models.memes.create(outgoingPayload, (err) => {
  //     if (err) {
  //       // Send error
  //       res.send(err);
  //     } else {
  //       // Success
  //       console.log('Meme database updated successfully');
  //     }
  //   });
  //
  //   // Return results
  //   res.send('ok');
