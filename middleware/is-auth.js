module.exports = (req, res, next) => {
  if (!req.session.user) {
    console.log('You must be logged in to see the requested page, redirect to login');
    return res.status(401).redirect('/login');
  }
  next();
}
