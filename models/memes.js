'use strict';

module.exports = (db, cb) => {
  db.define('memes', {
    id: { type: 'serial', key: true },
    builder: String,
    date: String,
    rating: Number,
    gallery: String,
    tags: String,
    author: String,
    top: String,
    bottom: String,
  });
  return cb();
};
