const express = require('express');
const app = express();
const session = require('express-session');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const flash = require('express-flash');
const passport = require('passport');
const { loginCheck } = require('./auth/passport');

dotenv.config();
loginCheck(passport);

const database = process.env.MONGOLAB_URI;
mongoose.connect(database, { useUnifiedTopology: true, useNewUrlParser: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: false }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'default-secret',
  resave: true,
  saveUninitialized: true
}));

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

app.use('/', require('./routes/login'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));