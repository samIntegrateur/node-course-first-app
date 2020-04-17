const requestHandler = (req, res) => {
  const url = req.url;
  const method = req.method;
  console.log('url', url);
  console.log('method', method);
  if (url === '/') {
    res.write('<html>');
    res.write('<head><title>Welcome page</title></head>');
    res.write(`
        <body>
            <h1>Hello world</h1>
            <form method="post" action="/create-user">
                <label>Enter name</label>
                <input type="text" name="username" />
                <button type="submit">Send</button>
            </form>
        </body>
    `);
    res.write('</html>');
    return res.end();
  }
  if (url === '/create-user' && method === 'POST') {
    const body = [];
    req.on('data', (chunk) => {
      console.log('chunk', chunk);
      body.push(chunk);
    });
    return req.on('end', () => {
      const parsedBody = Buffer.concat(body).toString();
      console.log('parsedBody', parsedBody);
      const message = parsedBody.split('=')[1];
      console.log('You have typed', message);
      res.statusCode = 302;
      res.setHeader('Location', '/');
      return res.end();
    });
  }
  if (url === '/users') {
    res.write('<html>');
    res.write('<head><title>Users page</title></head>');
    res.write('<body><h1>Users</h1><ul><li>Bob</li><li>John</li><li>Paul</li></ul></body>');
    res.write('</html>');
  }
  console.log('no route catched');
  res.end();
};

module.exports = requestHandler;
