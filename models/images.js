'use strict';

module.exports = (db, cb) => {
  db.define('images', {
    id: { type: 'serial', key: true },
    imageid: String,
    tags: String,
    date: { type: 'date', time: true },
    builder: String,
    credit: String,
    company: String,
  });
  return cb();
};
