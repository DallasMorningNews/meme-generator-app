'use strict';

module.exports = (app) => {
  // Meta data
  const meta = require('../meta.json');

  // JUST RENDER THE PAGE
  app.get('/gallery/:galleryid', (req, res) => {
    const galleryid = req.params.galleryid;
    console.log(`Loading builder with ${galleryid}`);

    req.models.galleries.find({ id: galleryid }, (err, page) => {
      if (err) throw err;
      console.log(page);
      console.log(`${page.length} pages found.`);
      console.log(`Head: ${page[0].head}`);
      meta.page = page[0];
      res.render('gallery.html', meta);
      // console.log(meta.page[0].author);
    });
  });
};
