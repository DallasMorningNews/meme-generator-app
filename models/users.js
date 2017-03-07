module.exports = (db, cb) => {
  db.define('users', {
    key: { type: 'serial', key: true },
    id: String,
    email: String,
    password: String,
    first_name: String,
    last_name: String,
    is_admin: Boolean,
  });
  return cb();
};
