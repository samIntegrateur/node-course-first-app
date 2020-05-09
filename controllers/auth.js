const User = require('../models/user');

exports.getLogin = (req, res, next) => {
  console.log('session', req.session);
  res.render('auth/login', {
    docTitle: 'Login',
    path: '/login',
    isAuthenticated: req.user,
  });
};

exports.postLogin = (req, res, next) => {

  User.findById('5eb430941d41ca46b4d04ac8')
    .then(user => {
      if (user) {
        req.session.user = user; // create a session data, store it in mongodb and add a connect.sid cookie to identify it
        req.session.save(err => { // not mandatory, check it's done before redirecting
          if (err) {
            console.log('err', err);
          }
          res.redirect('/');
        });
      } else {
        console.warn('user not found');
        res.redirect('/');
      }
    })
    .catch(err => console.log('err', err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => { // will delete it in mongodb too
    if (err) {
      console.log('err', err);
    }
    res.redirect('/');
  });
}
