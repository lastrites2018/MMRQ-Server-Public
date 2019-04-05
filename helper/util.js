const fs = require('fs');
const path = require('path');
const userdb = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../db.json'), 'UTF-8')
);
const jwt = require('jsonwebtoken');
// const userdb = JSON.parse(fs.readFileSync('', 'UTF-8'));
const SECRET_KEY = '123456789';
const expiresIn = '1h';

const createToken = payload => {
  return jwt.sign(payload, SECRET_KEY, { expiresIn });
};

const verifyToken = token => {
  return jwt.verify(token, SECRET_KEY, (err, decode) => {
    console.log('decode', decode);
    return decode !== undefined ? decode : err;
  });
};

const isAuthenticated = ({ email, password }) => {
  return userdb.users.findIndex(user => {
    return user.email === email && user.password === password;
  });
};

module.exports = {
  createToken,
  verifyToken,
  isAuthenticated
};
