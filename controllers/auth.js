const bcrypt = require('bcryptjs');

const User = require('../models/user');


exports.getLogin = (req, res, next) => {
  const flashError = req.flash('error');
  const errorMessage = flashError.length > 0 ? flashError[0] : null;
  res.render('auth/login', {
    docTitle: 'Login',
    path: '/login',
    errorMessage: errorMessage,
  });
};

exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;

  User.findOne({ email: email })
    .then(user => {
      if (user) {
        bcrypt.compare(password, user.password)
          .then(doMatch => {
            if (doMatch) {
              console.log('LOGIN SUCCEED');

              req.session.user = user; // create a session data, store it in mongodb and add a connect.sid cookie to identify it
              return req.session.save(err => { // not mandatory, check it's done before redirecting
                if (err) {
                  console.log('err', err);
                }
                res.redirect('/');
              });
            }
            console.log('WRONG PASSWORD');
            req.flash('error', 'Invalid Password.');
            res.redirect('/login');
          })
          .catch(err => {
            console.log('err', err);
            req.flash('error', err);
            res.redirect('/login');
          });

      } else {
        console.warn('USER NOT FOUND');
        // Flash method to add just a one time message
        // https://www.udemy.com/course/nodejs-the-complete-guide/learn/lecture/11954380#overview
        req.flash('error', 'Invalid e-mail.');
        res.redirect('/login');
      }
    })
    .catch(err => console.log('err', err));
};

exports.getSignup = (req, res, next) => {
  const flashError = req.flash('error');
  const errorMessage = flashError.length > 0 ? flashError[0] : null;
  res.render('auth/signup', {
    docTitle: 'Signup',
    path: '/signup',
    errorMessage: errorMessage,
  });
};

exports.postSignup = (req, res, next) => {
  const { email, password, confirmPassword } = req.body;
  User.findOne({ email: email })
    .then(userDoc => {
      if (userDoc) {
        console.log('EMAIL ALREADY EXISTS');
        req.flash('error', 'E-mail already exists.');
        return res.redirect('/signup');
      }

      return bcrypt.hash(password, 12)
        .then(hashedPassword => {
          const user = new User({
            email: email,
            password: hashedPassword,
            cart: { items: [] },
          })
          return user.save();
        })
        .then(result => {
          console.log('USER CREATED');
          return res.redirect('/');
        })
        .catch(err => console.log('err', err));

    })
    .catch(err => console.log('err', err));
}

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => { // will delete it in mongodb too
    if (err) {
      console.log('err', err);
    }
    res.redirect('/');
  });
}
