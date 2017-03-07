module.exports = (app) => {
  // SEARCH TAGS FOR BASE IMAGES
  app.post('/admin/search', (req, res) => {
    console.log('Loading admin-search-images.js');
    const data = req.body;
    req.models.images.find().where('tags LIKE ?', [`%${data.tags}%`]).run((err, results) => {
      res.send(results);
    });
  });
};
