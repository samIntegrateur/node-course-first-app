const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const db = require('./util/database');

const app = express();
app.use(favicon(path.join(__dirname, 'public', 'img', 'favicon.ico')));

// Set a template engine
// https://expressjs.com/fr/api.html#app.set
// pug and ejs are built-in so we don't need the engine step
// app.engine('hbs', expressHandlebars({
//   layoutsDir: 'views/layouts/',
//   defaultLayout: 'main-layout',
//   extname: 'hbs', // only for defaultLayout (shame)
// }));
app.set('view engine', 'ejs');
// where to find templates
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const errorController = require('./controllers/error');

// can parse content from form
app.use(bodyParser.urlencoded({extended: false}));

// Read access to public dir
app.use(express.static(path.join(__dirname, 'public')));

// Add middleware
// app.use( (req, res, next) => {
//   next(); // Allows the request to continue to the next middleware
// });

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

// const server = http.createServer(app);

// Event loop pattern
// https://www.udemy.com/course/nodejs-the-complete-guide/learn/lecture/11561888#overview
// server.listen(3000);

// With express we can do both createserver and listen in one
app.listen(3000);
