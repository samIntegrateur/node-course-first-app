exports.get404 = (req, res) => {
  res.status(404).render('404', {
    docTitle: "Page not found",
    path: null,
  })
};
