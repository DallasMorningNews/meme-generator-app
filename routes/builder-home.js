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
      // console.log(page);
      // console.log(`${page.length} pages found.`);
      // console.log(`Head: ${page[0].head}`);
      meta.page = page[0];

      // Append keywords from buiolder to meta.json's existing keywords.
      const keywords = page[0].tags.split(', ');
      for (const keyword of keywords){
        meta.keywords.push(keyword);
      }

      // Get published year
      const date = new Date(parseFloat(page[0].date));
      const year = date.getFullYear();

      // Build published date
      const fullDate = `${year}-${date.getMonth() + 1}-${date.getDate()}T00:00:00Z`;
      meta.publishDate = fullDate;

      // Build authors
      meta.authors = page[0].author;
      meta.shareText = page[0].intro;
      meta.tweetText = page[0].intro;
      meta.pageTitle = page[0].head;
      meta.shareTitle = page[0].head;
      meta.desk = page[0].desk;
      meta.url = `http://apps.dallasnews.com/meme-generator/builder/${page[0].id}`;

      // Get first meme submitted for promo image
      req.models.memes.find({ builder: page[0].id }).limit(1).run((err, firstMeme) => {
        if (err) { console.log(err); }
        meta.imgURL = `https://dmnmeme.s3.amazonaws.com/${firstMeme[0].date}.png`;
        console.log(meta);
        res.render('builder.html', meta);
      });
    });
  });
};
