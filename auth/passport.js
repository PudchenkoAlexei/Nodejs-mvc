const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const loginCheck = passport => {
  passport.use(
    new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
      User.findOne({ email: email })
        .then((user) => {
          if (!user) {
            return done(null, false, { message: "Wrong email" });
          }
          bcrypt.compare(password, user.password, (error, isMatch) => {
            if (error) {
              return done(error);
            }
            if (isMatch) {
              return done(null, user);
            } else {
              return done(null, false, { message: "Wrong password" });
            }
          });
        })
        .catch((error) => done(error));
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser((id, done) => {
    User.findById(id, (error, user) => {
      done(error, user);
    });
  });
};

module.exports = {
  loginCheck,
};