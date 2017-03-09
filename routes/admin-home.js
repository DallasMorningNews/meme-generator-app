'use strict';

module.exports = function(app) {
    // Meta data
    var meta = require('../meta.json');

    // JUST RENDER THE PAGE
    app.get('/admin', function (req, res) {
      console.log('Loading admin-home');
      // console.log(req.session);
      // if user is authenticated in the session, carry on
      if (req.isAuthenticated() ){
        res.render('admin.html', meta);
      } else {
        res.redirect('/meme-generator/login');
      }
    });
}
