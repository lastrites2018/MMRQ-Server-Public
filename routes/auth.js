const jsonServer = require('json-server');
const server = jsonServer.create();
const fs = require('fs');
const { createToken, verifyToken, isAuthenticated } = require('../helper/util');
const path = require('path');
const userdb = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../db.json'), 'UTF-8')
);

server.get('/auth/decode', (req, res) => {
  // router.get('/auth/decode', (req, res) => {
  let decode = false;
  let cookie;
  let element;
  if (!req.headers.cookie) {
    return;
  }

  if (req.headers.cookie.includes(';')) {
    cookie = req.headers.cookie.split(';').map(function(element) {
      element = element.split('=');
      return {
        key: element[0],
        value: element[1]
      };
    });
  } else {
    element = element.split('=');
    cookie = {
      key: element[0],
      value: element[1]
    };
  }
  for (let i = 0; i < cookie.length; i++) {
    if (cookie[i].key === 'token' || cookie[i].key === ' token') {
      decode = verifyToken(cookie[i].value);
    }
  }
  if (decode === false) {
    const status = 401;
    const message = '권한 없이 유저 목록을 볼 수 없습니다.';
    res.status(status).json({ status, message });
    return;
  } else {
    const status = 201;
    res.status(status).json({ status, decode });
    return;
  }
});

server.get('/auth/check', (req, res) => {
  // router.get('/auth/check', (req, res) => {
  let decode;
  if (
    req.headers.authorization === undefined ||
    req.headers.authorization.split(' ')[0] !== 'Bearer'
  ) {
    const status = 401;
    const message = 'Error in auth/check format';
    res.status(status).json({ status, message });
    return;
  }
  try {
    decode = verifyToken(req.headers.authorization.split(' ')[1]);
    let userIndex = userdb.users.findIndex(user => {
      return decode.email === user.email && decode.handphone === user.handphone;
    });

    let userInfo = userdb.users[userIndex];
    const status = 201;
    res.status(status).json({ status, userInfo });
    return;
  } catch (err) {
    const status = 401;
    const message = 'Error access_token is revoked';
    res.status(status).json({ status, message });
  }
});

server.post('/auth/login', (req, res) => {
  // router.post('/auth/login', (req, res) => {
  const { email, password } = req.body;

  let userIndex = isAuthenticated({ email, password });
  if (userIndex === -1) {
    console.log('user auth try failed');
    const status = 401;
    const message = 'Incorrect email or password';
    res.status(status).json({ status, message });
    return;
  }

  let handphone = userdb.users[userIndex].handphone;

  const access_token = createToken({ email, handphone });

  res.status(200).json({ access_token });
});

server.get('/users', (req, res) => {
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
    var decode = verifyToken(req.headers.authorization.split(' ')[1]);
    const status = 201;
    if (decode.email) {
      res.status(status).json({ status, userdb });
      return;
    }
    next();
  } catch (err) {
    const status = 401;
    const message = 'Error access_token is revoked';
    res.status(status).json({ status, message });
  }
});

module.exports = server;
