const passport = require("passport");
const User = require('../models/User');
const bcrypt = require('bcryptjs');

class RegisterUserCommand {
  constructor({ name, email, location, password, confirm, res }) {
    this.name = name;
    this.email = email;
    this.password = password;
    this.confirm = confirm;
    this.location = location;
    this.res = res;
  }

  execute() {
    if (!this.name || !this.email || !this.password || !this.confirm) {
      return this.res.render("register", {
        error: 'Please fill in all fields',
        name: this.name,
        email: this.email,
        password: this.password,
        confirm: this.confirm
      });
    }

    if (this.password !== this.confirm) {
      return this.res.render("register", {
        error: 'Passwords must match',
        name: this.name,
        email: this.email,
        password: this.password,
        confirm: this.confirm
      });
    }

    User.findOne({ email: this.email }).then((user) => {
      if (user) {
        return this.res.render("register", {
          error: 'Email already exists',
          name: this.name,
          email: this.email,
          password: this.password,
          confirm: this.confirm
        });
      }

      const newUser = User.Director.createCustomUser(
        this.name,
        this.email,
        this.password,
        this.location,
        new Date()
      );

      bcrypt.genSalt(10, (err, salt) =>
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) {
            return this.res.render("register", {
              error: 'Error hashing password',
              name: this.name,
              email: this.email,
              password: this.password,
              confirm: this.confirm
            });
          }
          newUser.password = hash;
          newUser.save()
            .then(() => this.res.redirect("/login"))
            .catch(err => {
              return this.res.render("register", {
                error: 'Error saving user',
                name: this.name,
                email: this.email,
                password: this.password,
                confirm: this.confirm
              });
            });
        })
      );
    });
  }
}

class LoginUserCommand {
  constructor({ email, password, req, res }) {
    this.email = email;
    this.password = password;
    this.req = req;
    this.res = res;
  }

  execute() {
    if (!this.email || !this.password) {
      return this.res.render('login', {
        error: 'Please fill in all the fields',
        email: this.email,
        password: this.password
      });
    }

    passport.authenticate('local', (err, user, info) => {
      if (err) {
        return this.res.render('login', {
          error: 'Authentication error',
          email: this.email,
          password: this.password
        });
      }
      if (!user) {
        return this.res.render('login', {
          error: info.message || 'Invalid email or password',
          email: this.email,
          password: this.password
        });
      }
      this.req.logIn(user, (err) => {
        if (err) {
          return this.res.render('login', {
            error: 'Login error',
            email: this.email,
            password: this.password
          });
        }
        return this.res.redirect('/dashboard');
      });
    })(this.req, this.res);
  }
}

const registerUser = (req, res) => {
  const { name, email, location, password, confirm } = req.body;

  const command = new RegisterUserCommand({
    name, email, location, password, confirm, res
  });

  command.execute();
};

const loginUser = (req, res) => {
  const { email, password } = req.body;

  const command = new LoginUserCommand({
    email, password, req, res
  });

  command.execute();
};

const registerView = (req, res) => {
  res.render("register", {});
};

const loginView = (req, res) => {
  res.render("login", {});
};

const homeView = (req, res) => {
  res.render("home", {});
};

module.exports = {
  registerView,
  loginView,
  registerUser,
  loginUser,
  homeView
};