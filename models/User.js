const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  location: {
    type: String,
    default: 'Kyiv'
  },
  date: {
    type: Date,
    default: Date.now
  },
});

const User = mongoose.model("User", UserSchema);

class UserBuilder {
  constructor(name, email, password) {
    this.userData = { name, email, password };
  }

  setLocation(location) {
    this.userData.location = location;
    return this;
  }

  setDate(date) {
    this.userData.date = date;
    return this;
  }

  build() {
    return new User(this.userData);
  }
}

User.Builder = UserBuilder;

module.exports = User;
