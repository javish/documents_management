require('dotenv/config');

const uuid = require('uuid/v4');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { UsersRepository } = require('../../repositories/users.repository');
const { withStatusCode } = require('../../utils/response.util');
const { withError } = require('../../utils/response.util');
const { parseWith } = require('../../utils/request.util');
const { withProcessEnv } = require('../../dynamodb.factory');

const docClient = withProcessEnv(process.env)();
const repository = new UsersRepository(docClient);
const created = withStatusCode(201, JSON.stringify);
const parseJson = parseWith(JSON.parse);

const handler = async (event) => {
  const { body } = event;
  var user = await parseJson(body);
  await checkIfInputIsValid(user);
  
  const dbUser = await repository.getByLoginId(user.email);
  if(!dbUser){
    console.log("Adding new user");
    var hash = await bcrypt.hash(user.password, 10);
    const userRec = {
      "loginId": user.email,
      "Id": uuid(),
      "name": user.name,
      "password": hash,
      "status": "Active"
    }
    user = await repository.put(userRec);
    const token = jwt.sign({id: user.id, email: user.email}, process.env.JWT_SECRET, {expiresIn: 86400});
    user.token = token;
  }
  else{
    withError('User with email already exists');
  }

  return created(user);
};

function checkIfInputIsValid(user) {
  if (user.password && user.password.length <= 7) {
    return withError('Password error. Password needs to be minimum 8 characters.');
  }

  if (user.name && user.name.length < 4 && typeof user.name === 'string'){
     return withError('Username error. Username needs to be minimum 4 character');
  }

  if (!(user.email && typeof user.name === 'string')){
    return withError('Email error. Email must have valid characters.');
  }
};


module.exports = {
  handler
};