require('dotenv/config');

const uuid = require('uuid/v4');
const bcrypt = require('bcryptjs');

const { UsersRepository } = require('../../repositories/users.repository');
const { withStatusCode } = require('../../utils/response.util');
const { parseWith } = require('../../utils/request.util');
const { withProcessEnv } = require('../../dynamodb.factory');
const { signAndGenerateToken } = require('../../utils/auth.util');

const docClient = withProcessEnv(process.env)();
const repository = new UsersRepository(docClient);
const created = withStatusCode(201, JSON.stringify);
const badRequest = withStatusCode(400);
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
    const token = signAndGenerateToken(user.Id, event);
    user.token = token;
  }
  else{
    console.error('User with email already exists');
    return badRequest();
  }

  return created(user);
};

function checkIfInputIsValid(user) {
  if (user.password && user.password.length <= 7) {
    console.error('Password error. Password needs to be minimum 8 characters.');
    return badRequest();
  }

  if (user.name && user.name.length < 4 && typeof user.name === 'string'){
    console.error('Username error. Username needs to be minimum 4 character');
    return badRequest();
  }

  if (!(user.email && typeof user.name === 'string')){
    console.error('Email error. Email must have valid characters.');
    return badRequest();
  }
};


module.exports = {
  handler
};