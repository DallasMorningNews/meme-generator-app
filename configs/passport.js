'use strict';

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

require('dotenv').load();

// Use the GoogleStrategy within Passport.
// Strategies in Passport require a `verify` function, which accept
// credentials (in this case, an accessToken, refreshToken, and Google
// profile), and invoke a callback with a user object.
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_KEY,
  clientSecret: process.env.GOOGLE_SECRET,
  // http://apps.dallasnews.com/meme-generator/auth/google/callback
  //callbackURL: 'http://apps.dallasnews.com/meme-generator/auth/google/callback',
  callbackURL: 'http://localhost:4000/meme-generator/auth/google/callback',
}, (accessToken, refreshToken, profile, done) => {
  if (profile._json.domain === 'dallasnews.com') {
    // find or create user in database, etc
    done(null, profile);
  } else {
    // fail
    done(null, false, new Error('Invalid host domain'));
  }
}));
//
passport.serializeUser(function(profile, done) {
  // console.log('serializing profile.');
  done(null, profile.id);
});

passport.deserializeUser(function(id, done) {
  // console.log('deserialize profile.');
  done(null, id);
});
