require('dotenv/config');

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


const { UsersRepository } = require('../../repositories/users.repository');
const { withStatusCode } = require('../../utils/response.util');
const { withProcessEnv } = require('../../dynamodb.factory');
const { parseWith } = require('../../utils/request.util');


const docClient = withProcessEnv(process.env)();
const repository = new UsersRepository(docClient);
const ok = withStatusCode(200, JSON.stringify);
const badRequest = withStatusCode(400);
const parseJson = parseWith(JSON.parse);

exports.handler = async (event) => {
  const { body } = event;
  const user = await parseJson(body);
  
  const dbUser = await repository.getByLoginId(user.email);
  if (!dbUser){
    return badRequest();
  }
  else{
    const valid = await bcrypt.compare(user.password, dbUser.password)
    if(!valid){
        return badRequest();
    }
  }
  const token = jwt.sign({id: user.id, email: user.email}, process.env.JWT_SECRET, {expiresIn: 86400});
  var responseToken = {
    "token": token
  };
  
  return ok(responseToken);
};
