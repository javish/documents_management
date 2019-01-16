const jwt = require('jsonwebtoken')
require('dotenv').config()

function getUserId(request) {
  const Authorization = request.headers.Authorization;
  if (Authorization) {
    const secret = process.env.JWT_SECRET + request.headers['User-Agent'];
    const token = Authorization.replace('Bearer ', '');
    const {id} = jwt.verify(token, secret);
    return id;
  }
  throw new Error('Not authenticated')
};

function signAndGenerateToken(userId, request){
  const secret = process.env.JWT_SECRET + request.headers['User-Agent'];
  const token = jwt.sign({id: userId}, secret, {expiresIn: 10000});
  return token;
};

module.exports = {
  getUserId,
  signAndGenerateToken
}