const fs = require('fs');
const bodyParser = require('body-parser');
const jsonServer = require('json-server');
const jwt = require('jsonwebtoken');
// var cors = require('cors');
// var express = require('express');
// var app = express();

const server = jsonServer.create();
const router = jsonServer.router('./db.json');
const middlewares = jsonServer.defaults();
const userdb = JSON.parse(fs.readFileSync('./db.json', 'UTF-8'));

const authRouter = require('./routes/auth.js');
const fileuploadRouter = require('./routes/fileupload.js');

server.use(middlewares);
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

server.use(
  /^(?!\/auth|\/find|\/witness|\/users|\/fileupload).*$/,
  (req, res, next) => {
    if (
      req.headers.authorization === undefined ||
      req.headers.authorization.split(' ')[0] !== 'Bearer'
    ) {
      const status = 401;
      const message = 'Error in authorization format';
      res.status(status).json({ status, message });
      return;
    }
    try {
      verifyToken(req.headers.authorization.split(' ')[1]);
      next();
    } catch (err) {
      const status = 401;
      const message = 'Error access_token is revoked';
      res.status(status).json({ status, message });
    }
  }
);

server.use('/', authRouter);
server.use('/fileupload', fileuploadRouter);
server.use(router);

var port = 5000;
server.listen(port, () => {
  console.log(`Run Auth API Server : ${port}`);
});
