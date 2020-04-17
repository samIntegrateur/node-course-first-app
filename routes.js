const fs = require('fs');

const requestHandler = (req, res) => {
  const url = req.url;
  const method = req.method;

  if (url === '/') {
    console.log('form page');

    res.write('<html>');
    res.write('<head><title>Enter message</title></head>');
    res.write('<body><form action="/message" method="POST"><input name="message" type="text" /><button type="submit">Send</button></form></body>');
    res.write('</html>');
    return res.end();
  }
  if (url === '/message' && method === 'POST') {
    const body = [];
    // We can access data without waiting for the request to complete
    // https://www.udemy.com/course/nodejs-the-complete-guide/learn/lecture/11561900#overview
    req.on('data', (chunk) => {
      console.log('chunk', chunk);
      body.push(chunk);
    });
    return req.on('end', () => {
      // our form send us a key/value pair, wa can make it a string
      const parsedBody = Buffer.concat(body).toString();
      const message = parsedBody.split('=')[1];
      console.log('parsedBody', parsedBody);

      // sync for synchronous, stops code execution until it's done
      // fs.writeFileSync('message.txt', message);

      // async way
      fs.writeFile('message.txt', message, err => {
        // res.writeHead(302, {});
        res.statusCode = 302;
        // redirect to /
        res.setHeader('Location', '/');
        return res.end();
      });

    });
    // this will happen before the code in our event listener
    // we have to move it if we want to be a "consequence"
    // https://www.udemy.com/course/nodejs-the-complete-guide/learn/lecture/12310980#overview
    console.log('message page');
  }
  res.setHeader('Content-Type', 'text/html');
  res.write('<html>');
  res.write('<head><title>My first page</title></head>');
  res.write('<body><h1>Hello from server</h1></body>');
  res.write('</html>');
  res.end();
};

// module.exports = {
//   handler: requestHandler,
//   someText: 'Lorem ipsum',
// };
// or
// module.exports.handler = requestHandler;
// module.exports.someText = 'Lorem ipsum';
// shortcut without module
exports.handler = requestHandler;
exports.someText = 'Lorem ipsum';
