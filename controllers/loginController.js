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
      console.log("Fill empty fields");
      return this.res.render("register", {
        name: this.name,
        email: this.email,
        password: this.password,
        confirm: this.confirm
      });
    }

    if (this.password !== this.confirm) {
      console.log("Password must match");
      return this.res.render("register", {
        name: this.name,
        email: this.email,
        password: this.password,
        confirm: this.confirm
      });
    }

    User.findOne({ email: this.email }).then((user) => {
      if (user) {
        console.log("Email exists");
        return this.res.render("register", {
          name: this.name,
          email: this.email,
          password: this.password,
          confirm: this.confirm
        });
      }

      const newUser = new User.Builder(this.name, this.email, this.password)
        .setLocation(this.location)
        .build();

      bcrypt.genSalt(10, (err, salt) =>
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser.save()
            .then(() => this.res.redirect("/login"))
            .catch(err => console.log(err));
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
      console.log('Please fill in all the fields');
      return this.res.render('login', {
        email: this.email,
        password: this.password
      });
    }

    passport.authenticate('local', {
      successRedirect: '/dashboard',
      failureRedirect: '/login',
      failureFlash: true
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
