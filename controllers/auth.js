const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const crypto = require('crypto');
const { validationResult } = require('express-validator');

const User = require('../models/user');

const transporter = nodemailer.createTransport(sendgridTransport({
  auth: {
    api_key: process.env.SEND_GRID_KEY,
  }
}));

exports.getLogin = (req, res, next) => {
  const flashError = req.flash('error');
  const errorMessage = flashError.length > 0 ? flashError[0] : null;
  res.render('auth/login', {
    docTitle: 'Login',
    path: '/login',
    errorMessage: errorMessage,
    formValues: { email: '', password: '' },
    validationErrors: [],
  });
};

exports.postLogin = (req, res, next) => {
  const { email, password } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // if errors, render the same page
    return res.status(422).render('auth/login', {
      docTitle: 'Login',
      path: '/login',
      errorMessage: errors.array()[0].msg,
      formValues: { email, password },
      validationErrors: errors.array(),
    });
  }

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
            return res.status(422).render('auth/login', {
              docTitle: 'Login',
              path: '/login',
              errorMessage: 'Invalid password',
              formValues: { email, password },
              validationErrors: [{param: 'password'}],
            });
          })
          .catch(err => {
            console.log('err', err);
            req.flash('error', err);
            res.redirect('/login');
          });

      } else {
        return res.status(422).render('auth/login', {
          docTitle: 'Login',
          path: '/login',
          errorMessage: 'Invalid user',
          formValues: { email, password },
          validationErrors: [{param: 'email'}],
        });
        // console.warn('USER NOT FOUND');
        // Flash method to add just a one time message
        // https://www.udemy.com/course/nodejs-the-complete-guide/learn/lecture/11954380#overview
       // req.flash('error', 'Invalid e-mail.');
        res.redirect('/login');
      }
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getSignup = (req, res, next) => {
  const flashError = req.flash('error');
  const errorMessage = flashError.length > 0 ? flashError[0] : null;
  res.render('auth/signup', {
    docTitle: 'Signup',
    path: '/signup',
    errorMessage: errorMessage,
    formValues: { email: '', password: '', confirmPassword: '' },
    validationErrors: [],
  });
};

exports.postSignup = (req, res, next) => {
  const { email, password, confirmPassword } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log('errors.array()', errors.array());

    // if errors, render the same page
    return res.status(422).render('auth/signup', {
      docTitle: 'Signup',
      path: '/signup',
      errorMessage: errors.array()[0].msg,
      formValues: { email, password, confirmPassword },
      validationErrors: errors.array(),
    });
  }

  bcrypt.hash(password, 12)
    .then(hashedPassword => {
      const user = new User({
        email: email,
        password: hashedPassword,
        cart: {items: []},
      })
      return user.save();
    })
    .then(result => {
      console.log('USER CREATED');
      res.redirect('/login');
      return transporter.sendMail({
        to: email,
        from: 'samuel.desbos@gmail.com',
        subject: 'Signup succeeded !',
        html: '<h1>You successfully signed up !</h1>',
      })

    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });

}

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => { // will delete it in mongodb too
    if (err) {
      console.log('err', err);
    }
    res.redirect('/');
  });
}

exports.getReset = (req, res, next) => {
  const flashError = req.flash('error');
  const errorMessage = flashError.length > 0 ? flashError[0] : null;
  res.render('auth/reset', {
    docTitle: 'Reset password',
    path: '/reset',
    errorMessage: errorMessage,
  });
};

exports.postReset = (req, res, next) => {
  // generate a token
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log('err', err);
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex');

    // find user by email
    User.findOne({email: req.body.email})
      .then(user => {
        if (!user) {
          req.flash('error', 'No account found for this email.');
          return res.redirect('/reset');
        }

        // save token infos
        user.resetToken = token;
        const tomorrow = Date.now() + 36000000;
        user.resetTokenExpiration = new Date(tomorrow); // one day from now
        return user.save()
          .then(result => {
            res.redirect('/');
            return transporter.sendMail({
              to: req.body.email,
              from: 'samuel.desbos@gmail.com',
              subject: 'Password reset',
              html: `
            <p>You requested a password reset.</p>
            <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
            <p>Nb: this link is only available for 24 hours. Beyond you will need to make a new "reset password" request.</p>
          `,
            })
          })
          .catch(err => {
            throw new Error(err);
          });
      })
      .catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  // Check if the token param fits a user's resetToken
  // And if expiration is not passed
  const token = req.params.token;
  User.findOne({resetToken: token, resetTokenExpiration: {$gt: new Date()}})
    .then(user => {
      if (!user) {
        req.flash('error', 'We couldn\'t find a user for the password reset request. Maybe the link has expired.');
        return res.redirect('/reset');
      }

      const flashError = req.flash('error');
      const errorMessage = flashError.length > 0 ? flashError[0] : null;
      res.render('auth/new-password', {
        docTitle: 'New password',
        path: '/new-password',
        errorMessage: errorMessage,
        userId: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postNewPassword = (req, res, next) => {
  const userId = req.body.userId;
  const newPassword = req.body.password;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then(user => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then(hashedPassword => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then(result => {
      res.redirect('/login');
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
}
