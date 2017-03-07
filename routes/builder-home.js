'use strict';

module.exports = (app) => {
    // Meta data
  const meta = require('../meta.json');

  // JUST RENDER THE PAGE
  app.get('/builder/:pageid', (req, res) => {
    const pageid = req.params.pageid;
    console.log(`Loading builder with ${pageid}`);

    req.models.builders.find({ id: pageid }, (err, page) => {
      if (err) throw err;
      console.log(page);
      console.log(`${page.length} pages found.`);
      console.log(`Head: ${page[0].head}`);
      meta.page = page[0];
      res.render('builder.html', meta);
      // console.log(meta.page[0].author);
    });
  });
};
