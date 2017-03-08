'use strict';

const express = require('express');
const aws = require('aws-sdk');
const nunjucks = require('nunjucks');
const http = require('http');
const orm = require('orm');
const cors = require('cors');
const bodyParser = require('body-parser');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const session = require('express-session');

/*-------------------------------------------------------
    dotenv holds ALL the private credentials
-------------------------------------------------------*/
require('dotenv').load();
require('./configs/passport');

/*-------------------------------------------------------
    APP
-------------------------------------------------------*/
var app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false, limit: '5mb' }));
app.use(bodyParser.json({ limit: '5mb' }));

// Meta data
var meta = require('./meta.json');

/*-------------------------------------------------------
    SESSION
-------------------------------------------------------*/
app.use(session({
  secret: 'dank memes to rule the world',
  resave: true,
  saveUnitialized: true,
}));

/*-------------------------------------------------------
    PASSPORT
-------------------------------------------------------*/
app.use(passport.initialize());
app.use(passport.session());

/*-------------------------------------------------------
    DATABASE INIT
-------------------------------------------------------*/

// App connects to mysql database using credentials set in .env file
// process.env object is created by the dotenv load line above

app.use(orm.express(`mysql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}`, {
  define: function (db, models, next) {
    // Holds the raw images
    db.load('./models/images.js', () => {
      models.images = db.models.images;
    });
    db.load('./models/builders.js', () => {
      models.builders = db.models.builders;
    });
    db.load('./models/memes.js', () => {
      models.memes = db.models.memes;
    });
    db.load('./models/galleries.js', () => {
      models.galleries = db.models.galleries;
    });
    db.load('./models/users.js', () => {
      models.users = db.models.users;
    });
    db.sync();
    next();
  },
}));

/*-------------------------------------------------------
    ROUTES
-------------------------------------------------------*/
// Use an express router instead of the app itself to define routes.
// This lets us have more control over the location of the routes, for example
// mounting all the routes on a specific path for the app. See below.

const appRouter = express.Router();

require('./routes/index')(appRouter);

// Mount the router at a URL and all the router's other routes
// will be mounted below it, e.g., localhost:4000/meme-generator/homepage.html, etc.

app.use('/meme-generator', appRouter);


/*-------------------------------------------------------
    STATIC FILES
-------------------------------------------------------*/
app.use('/meme-generator', express.static('public'));

/*-------------------------------------------------------
    TEMPLATES
-------------------------------------------------------*/
const nenv = nunjucks.configure('templates', {
  autoescape: true,
  express: app,
  watch: true,
});

nenv.addFilter('cleantext', (str) => {
  str
      .replace(/"(?=\w)/g, '“')
      .replace(/"/g, '”')
      .replace(/\s'/g, ' ‘')
      // .replace(/\s'(?=\w|$)/g, "‘")
      .replace(/'/g, '’')
      .replace(/\w'\w/g, '’')
      .replace(/--/g, '—');
});

/*-------------------------------------------------------
    SERVER
-------------------------------------------------------*/
const server = http.createServer(app);
server.listen(3000, 'localhost');
server.on('listening', () => {
  console.log('Express server started on port %s at %s', server.address().port, server.address().address);
});
