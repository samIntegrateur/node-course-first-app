const express = require('express');
const authController = require('../controllers/auth');
const { check, body } = require('express-validator');
const router = express.Router();

const User = require('../models/user');

router.get('/login', authController.getLogin);
router.post('/login', [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid e-mail')
    .normalizeEmail(), // minify, etc
  body('password', 'Please enter a password with only numbers and text and at least 5 characters.')
    .isLength({min: 5})
    .isAlphanumeric()
    .trim(),
], authController.postLogin);

router.get('/signup', authController.getSignup);
router.post('/signup',
  [
    check('email') // check can be in the body, the headers or cookie, use body() to ensure it's from there
      .isEmail()
      .withMessage('Please enter a valid e-mail')
      .custom((value, {req}) => {
        // if (value === 'test@test.com') {
        //   throw new Error('This email address is forbidden');
        // }
        // return true;
        return User.findOne({ email: value })
          .then(userDoc => {
            if (userDoc) {
              return Promise.reject('E-mail already exists.');
            }
          })
      })
      .normalizeEmail(),
    body('password', 'Please enter a password with only numbers and text and at least 5 characters.')
      .isLength({min: 5})
      .isAlphanumeric()
      .trim(),
    body('confirmPassword')
      .trim()
      .custom((value, { req}) => {
        if (value !== req.body.password) {
          throw new Error('Password have to match.');
        }
        return true;
      })
  ],
  authController.postSignup);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);
router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);
router.post('/new-password', authController.postNewPassword);

module.exports = router;
