const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');

const app = express();
// overriden by html templates ?
app.use(favicon(path.join(__dirname, 'public', 'img', 'favicon.ico')));

// Set a template engine
// https://expressjs.com/fr/api.html#app.set
app.set('view engine', 'pug');
// where to find templates
app.set('views', 'views');

const adminData = require('./routes/admin');
const shopRoutes = require('./routes/shop');

// can parse content from form
app.use(bodyParser.urlencoded({extended: false}));

// Read access to public dir
app.use(express.static(path.join(__dirname, 'public')));

// Add middleware
// app.use( (req, res, next) => {
//   next(); // Allows the request to continue to the next middleware
// });

app.use('/admin', adminData.routes);
app.use(shopRoutes);

app.use((req, res, next) => {
  // res.status(404).sendFile(path.join(__dirname, 'views', '404.html'))
  res.status(404).render('404', {
    docTitle: "Page not found"
  })
});

// const server = http.createServer(app);

// Event loop pattern
// https://www.udemy.com/course/nodejs-the-complete-guide/learn/lecture/11561888#overview
// server.listen(3000);

// With express we can do both createserver and listen in one
app.listen(3000);
