const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');

const app = express();

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

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

app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, 'views', '404.html'))
});

// const server = http.createServer(app);

// Event loop pattern
// https://www.udemy.com/course/nodejs-the-complete-guide/learn/lecture/11561888#overview
// server.listen(3000);

// With express we can do both createserver and listen in one
app.listen(3000);
