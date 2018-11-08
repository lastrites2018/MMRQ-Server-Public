const fs = require('fs');
const bodyParser = require('body-parser');
const jsonServer = require('json-server');
const jwt = require('jsonwebtoken');
// var cors = require('cors');
// var express = require('express');
// var app = express();

const server = jsonServer.create();
const middlewares = jsonServer.defaults();
// Set default middlewares (logger, static, cors and no-cache)
// server.use(cors());
server.use(middlewares);
const router = jsonServer.router('./db.json');
const userdb = JSON.parse(fs.readFileSync('./db.json', 'UTF-8'));

server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());
// server.use(jsonServer.defaults());

const SECRET_KEY = '123456789';
const expiresIn = '1h';

var github = require('./config/dev');
// const router = require('express').Router();
const aws = require('aws-sdk');
const multer = require('multer');
//const multerS3 = require('multer-s3');

var memorystorage = multer.memoryStorage();
var upload = multer({ storage: memorystorage });

server.post('/fileupload', upload.array('profile'), function(req, res, next) {
  req.files.forEach(function(fileObj, index) {
    //라우터에 Multer 객체를 연결하면 input name이 일치하는 파일 데이터를 자동으로 받아서 req.files를 통해 접근할 수 있게 처리해 줍니다.
    //메모리 버퍼에 저장하는 형태를 선택했으므로 fileObj는 다음과 같은 속성을 갖게 됩니다.

    //예) Buffer 객체
    fileObj.buffer;

    //예) abc.jpg
    fileObj.originalname;

    //예)'image/jpeg'
    fileObj.mimetype;

    //아마존 S3에 저장하려면 먼저 설정을 업데이트합니다.
    aws.config.region = 'ap-northeast-2'; //Seoul
    aws.config.update({
      accessKeyId: github.accessKeyId,
      secretAccessKey: github.secretAccessKey
    });
    console.log('github', github);

    var s3_params = {
      Bucket: 'mmrq',
      Key: fileObj.originalname,
      ACL: 'public-read',
      ContentType: fileObj.mimetype
    };

    var s3obj = new aws.S3({ params: s3_params });
    s3obj
      .upload({ Body: fileObj.buffer })
      .on('httpUploadProgress', function(evt) {
        console.log(evt);
      })
      .send(function(err, data) {
        //S3 File URL
        console.log('err', err);
        console.log('data', data);
        var url = data.Location;
        console.log('url 반환 !');
        res.status(status).json({ status, url });

        //어디에서나 브라우저를 통해 접근할 수 있는 파일 URL을 얻었습니다.
      });
  });
});

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

server.get('/users', (req, res) => {
  // res.writeHead(200, { 'Access-Control-Allow-Origin': '*' });
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
    var decode = verifyToken(req.headers.authorization.split(' ')[1]);
    const status = 201;
    if (decode.email) {
      console.log('decode-email 존재한다!');
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

// server.get('/users', (req, res) => {
//   let cookie;
//   let element;

//   if (req.headers.cookie.includes(';')) {
//     cookie = req.headers.cookie.split(';').map(function(element) {
//       element = element.split('=');
//       return {
//         key: element[0],
//         value: element[1]
//       };
//     });
//   } else {
//     element = element.split('=');
//     cookie = {
//       key: element[0],
//       value: element[1]
//     };
//   }

//   for (let i = 0; i < cookie.length; i++) {
//     if (cookie[i].key === 'token' || cookie[i].key === ' token') {
//       decode = verifyToken(cookie[i].value);
//     }
//   }

//   if (decode.email !== 'test@test.com') {
//     const status = 401;
//     const message = '권한 없이 유저 목록을 볼 수 없습니다.';
//     res.status(status).json({ status, message });
//     return;
//   } else {
//     next();
//   }
// });

server.get('/auth/decode', (req, res) => {
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
  console.log('auth-check', req.headers);
  let decode = false;
  let cookie;
  let element;

  if (
    req.headers.authorization === undefined ||
    req.headers.authorization.split(' ')[0] !== 'Bearer'
  ) {
    const status = 401;
    const message = 'Error in auth/check format';
    // const message = '권한 없이 유저 목록을 볼 수 없습니다.';
    res.status(status).json({ status, message });
    return;
  }
  try {
    console.log('auth-check-try', req.headers.authorization.split(' ')[1]);
    decode = verifyToken(req.headers.authorization.split(' ')[1]);
    let userIndex = userdb.users.findIndex(
      user => decode.email === user.email && decode.handphone === user.handphone
    );

    let userInfo = userdb.users[userIndex];
    console.log('userInfo', userInfo);
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
  // res.writeHead(200, { 'Access-Control-Allow-Origin': '*' });
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

server.use(
  /^(?!\/auth|\/find|\/witness|\/users|\/fileupload).*$/,
  (req, res, next) => {
    // console.log('req', req);
    // res.writeHead(200, { 'Access-Control-Allow-Origin': '*' });
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
  }
);

server.use(router);

var port = 5000;
server.listen(port, () => {
  console.log(`Run Auth API Server : ${port}`);
});
