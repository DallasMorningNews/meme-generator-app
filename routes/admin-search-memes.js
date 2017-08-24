'use strict';

module.exports = (app) => {
  app
  // Get first meme from a builder
  .get('/admin/search/memes/first', (req, res) => {
    function getAllBuilders() {
      return new Promise((resolve, reject) => {
        req.models.builders.find({}, (err, builders) => {
          if (builders) {
            resolve(builders);
          } else {
            reject(Error('No builders found'));
          }
        });
      });
    }
    function getFirstMemes(builders) {
      return new Promise((resolve, reject) => {
        let numberOfBuilders = builders.length;
        for (const builder of builders) {
          req.models.memes.find({ builder: builder.id }).limit(1).run((err, firstMeme) => {
            if (err) { console.log(err); }
            builder.firstMeme = firstMeme;
            numberOfBuilders -= 1;
            if (numberOfBuilders === 0) {
              resolve(builders);
            }
          });
        }
      });
    }
    getAllBuilders()
      .then((builders) => {
        getFirstMemes(builders)
          .then((builders) => {
            res.json(builders);
          });
      });
  })
  // Count memes per builder
  .get('/admin/count/memes/byBuilder', (req, res) => {
    req.models.memes.aggregate(['builder']).count().groupBy('builder').get(function (err, builders) {
      console.log('err', err);
      console.log('builders', builders);
      res.json(builders);
    });
  })
  // Search by builder selected
  .get('/admin/search/memes/byBuilder/:builderID', (req, res) => {
    const builderID = req.params.builderID;
    req.models.memes.find({ builder: builderID }).run((err, results) => {
      if (err) { console.log(err); }
      res.json(results);
    });
  })
  // Search for meme backgrounds by builder selected
  .get('/admin/search/backgrounds/byBuilder/:builderID', (req, res) => {
    const builderID = req.params.builderID;
    req.models.builders.find({ id: builderID }).run((err, results) => {
      if (err) { console.log(err); }
      res.json(results);
    });
  })
  // Get all tags from all builders
  .get('/admin/search/memes/tags', (req, res) => {
    req.models.memes.find({}).run((err, results) => {
      if (err) { console.log(err); }
      let tags = [];
      for (const builder of results) {
        // Note extra space after comma to keep space out
        const tempArray = builder.tags.split(', ');
        tags = tags.concat(tempArray);
      }
      res.json(tags);
    });
  })
  // Search top and bottom strings
  .get('/admin/search/memes/string/:string', (req, res) => {
    const searchString = req.params.string;
    console.log(searchString);
    req.models.memes.find().where(
      'bottom LIKE ? OR top LIKE ?',
      [`%${searchString}%`],
      (err, results) => {
        if (err) { console.log(err); }
        res.send(results);
      } // Ignore comma-dangle error
    );
  });
};
