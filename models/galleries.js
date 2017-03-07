'use strict';

module.exports = function (db, cb) {
  db.define('galleries', {
    id: { type: 'serial', key: true },
    name: String,
    date: Date,
    head: String,
    intro: String,
    desk: String,
    tags: String,
    memes: String,
    author: String,
  });
  return cb();
};
