module.exports = (app) => {
  // Get all builders for moderate memes admin
  app.get('/admin/search/builders', (req, res) => {
    req.models.builders.find({}, (err, results) => {
      console.log('All builders route results');
      console.log(results);
      res.json(results);
    });
  });
};
