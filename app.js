// require a global module
const http = require('http');

const routes = require('./routes');

const server = http.createServer(routes.handler);

console.log('test');
console.log('routes text', routes.someText);

// Event loop pattern
// https://www.udemy.com/course/nodejs-the-complete-guide/learn/lecture/11561888#overview
server.listen(3000);
