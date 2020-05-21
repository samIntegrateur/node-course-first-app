exports.get404 = (req, res) => {
  res.status(404).render('404', {
    docTitle: "Page not found",
    path: '/404',
  })
};

exports.get500 = (req, res) => {
  res.status(500).render('500', {
    docTitle: "Page not found",
    path: '/500',
  })
};
