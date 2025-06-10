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
    if (!name || !email || !password) {
      throw new Error('Name, email, and password are required');
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      throw new Error('Invalid email format');
    }
    this.userData = { name, email, password };
  }

  setLocation(location) {
    if (location && typeof location !== 'string') {
      throw new Error('Location must be a string');
    }
    this.userData.location = location || 'Kyiv';
    return this;
  }

  setDate(date) {
    if (date && !(date instanceof Date)) {
      throw new Error('Date must be a valid Date object');
    }
    this.userData.date = date || new Date();
    return this;
  }

  build() {
    return new User(this.userData);
  }
}

class UserDirector {
  static createDefaultUser(name, email, password) {
    return new UserBuilder(name, email, password)
      .setLocation('Kyiv')
      .setDate(new Date())
      .build();
  }

  static createCustomUser(name, email, password, location, date) {
    return new UserBuilder(name, email, password)
      .setLocation(location)
      .setDate(date)
      .build();
  }
}

User.Builder = UserBuilder;
User.Director = UserDirector;

module.exports = User;
