'use strict';

module.exports = (app) => {
  // SEARCH TAGS FOR BASE IMAGES
  app.post('/admin/edit/backgrounds/byBuilder/:builderID', (req, res) => {
    const builderID = req.params.builderID;
    const data = req.body;
    console.log('DATA', data);
    console.log('STRINGIFIED', data.toString());
    req.models.builders.find({ id: builderID }).run((err, results) => {
      console.log('results BEFORE', results[0].images);
      results[0].images = data.toString();
      console.log('results AFTER', results[0].images);
      results[0].save((err) => {
        if (err) { res.send(err); }
        res.send('updated');
      });
    });
  });
};


// 1487104644728,1487104623614,1487104606056,1487104556823,1487104539521,1487104470825,1487104522958
