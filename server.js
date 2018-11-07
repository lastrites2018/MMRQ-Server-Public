const fs = require('fs');
const bodyParser = require('body-parser');
const jsonServer = require('json-server');
const jwt = require('jsonwebtoken');
var cors = require('cors');

const server = jsonServer.create();
const router = jsonServer.router('./db.json');
const userdb = JSON.parse(fs.readFileSync('./db.json', 'UTF-8'));

server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());
server.use(jsonServer.defaults());

const SECRET_KEY = '123456789';
const expiresIn = '1h';

let createToken = payload => {
  return jwt.sign(payload, SECRET_KEY, { expiresIn });
};

let verifyToken = token => {
  // console.log('token', token);
  return jwt.verify(token, SECRET_KEY, (err, decode) => {
    return decode !== undefined ? decode : err;
  });
};

let isAuthenticated = ({ email, password }) => {
  return userdb.users.findIndex(
    user => user.email === email && user.password === password
  );
};

server.use(cors());

server.get('/users', (req, res) => {
  let decode = false;
  var cookie = req.headers.cookie.split(';').map(function(element) {
    var element = element.split('=');
    return {
      key: element[0],
      value: element[1]
    };
  });
  for (let i = 0; i < cookie.length; i++) {
    if (cookie[i].key === 'token' || cookie[i].key === ' token') {
      decode = verifyToken(cookie[i].value);
    }
  }

  if (decode.email !== 'admin@admin.com') {
    const status = 401;
    const message = '권한 없이 유저 목록을 볼 수 없습니다.';
    res.status(status).json({ status, message });
    return;
  } else {
    next();
  }
});

server.get('/auth/decode', (req, res) => {
  let decode = false;
  var cookie = req.headers.cookie.split(';').map(function(element) {
    var element = element.split('=');
    return {
      key: element[0],
      value: element[1]
    };
  });
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
  // console.log(req.headers.cookie);
  // 원래는 헤더에 포함시켜야겠지만...
  // verifyToken(req.headers.cookie.split(' ')[1]);
  let decode = false;
  var cookie = req.headers.cookie.split(';').map(function(element) {
    var element = element.split('=');
    return {
      key: element[0],
      value: element[1]
    };
  });
  for (let i = 0; i < cookie.length; i++) {
    if (cookie[i].key === 'token' || cookie[i].key === ' token') {
      decode = verifyToken(cookie[i].value);
    }
  }
  if (decode === false || decode === undefined) {
    const status = 401;
    const message = '권한 없이 유저 목록을 볼 수 없습니다.';
    res.status(status).json({ status, message });
    return;
  } else {
    console.log('decode', decode);
    let userIndex = userdb.users.findIndex(
      user => decode.email === user.email && decode.handphone === user.handphone
    );

    let userInfo = userdb.users[userIndex];

    const status = 201;
    res.status(status).json({ status, userInfo });
    return;
  }
});

server.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  // console.log('rq', req.body);
  let userIndex = isAuthenticated({ email, password });
  if (userIndex === -1) {
    const status = 401;
    const message = 'Incorrect email or password';
    res.status(status).json({ status, message });
    return;
  }

  // console.log('userIndex', userIndex);
  let handphone = userdb.users[userIndex].handphone;

  const access_token = createToken({ email, handphone });

  console.log('access_token', access_token);
  res.status(200).json({ access_token });
});

server.use(/^(?!\/auth|\/find|\/witness|\/users).*$/, (req, res, next) => {
  // console.log('req', req);

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
    console.log('검증용', req.headers.authorization.split(' ')[1]);
    verifyToken(req.headers.authorization.split(' ')[1]);
    next();
  } catch (err) {
    const status = 401;
    const message = 'Error access_token is revoked';
    res.status(status).json({ status, message });
  }
});

server.use(router);

var port = 5000;
server.listen(port, () => {
  console.log(`Run Auth API Server : ${port}`);
});
