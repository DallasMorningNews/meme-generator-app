'use strict';

module.exports = (app) => {
  const formidable = require('formidable');

  app.post('/admin/create-builder', (req, res) => {
    console.log('Loading admin-create-builder.js');

    // Create an obj to hold return payload
    const formObj = {};

    // create an incoming form object
    const form = new formidable.IncomingForm();

    // Set date for builder
    const now = new Date();
    const timeID = Number(now);
    formObj.date = timeID.toString();

    // FIELD
    form.on('field', (name, field) => {
      console.log('Got a field:', field);
      if (name === 'desk' || name === 'tags') {
        formObj[name] = field.toLowerCase();
      } else {
        formObj[name] = field;
      }
    });

    // ERROR
    form.on('error', (err) => {
      console.log(`An error has occured: \n${err}`);
    });

    // END
    form.on('end', () => {
      req.models.builders.create(formObj, (err) => {
        console.log(formObj);
        if (err) {
          res.send(err);
        }
        res.send(formObj);
      });
    });

    form.parse(req);
  });
};
