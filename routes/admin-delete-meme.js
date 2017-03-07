module.exports = (app) => {
  const fs = require('fs');

  app
    // Get first meme from a builder
    .get('/admin/delete/memes/:memeID', (req, res) => {
      const trashMeme = req.params.memeID;
      console.log(trashMeme);
      req.models.memes.find({ date: trashMeme }).remove(() => {
        console.log(`unlinking ${trashMeme}`);
        fs.unlink(`./public/images/meme-images/thumbs/${trashMeme}.png`);
        fs.unlink(`./public/images/meme-images/${trashMeme}.png`);
        res.json('deleted');
      });
    });
};
