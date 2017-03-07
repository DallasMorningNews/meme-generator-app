module.exports = (app) => {
  // Auth routes
  require('./auth-home')(app);
  // Admin routes
  require('./admin-home')(app);
  // require('./admin-upload-image')(app);
  require('./admin-upload-image-s3')(app);
  require('./admin-search-images')(app);
  require('./admin-create-builder')(app);
  require('./admin-search-builders')(app);
  require('./admin-search-memes')(app);
  require('./admin-delete-meme')(app);
  require('./admin-create-gallery')(app);
  // Builder routes
  require('./builder-home')(app);
  // require('./builder-upload-meme')(app);
  require('./builder-upload-meme-s3')(app);
  // Gallery routes
  require('./gallery-home')(app);
};
