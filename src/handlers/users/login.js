require('dotenv/config');

const bcrypt = require('bcryptjs');

const { UsersRepository } = require('../../repositories/users.repository');
const { withStatusCode } = require('../../utils/response.util');
const { withProcessEnv } = require('../../dynamodb.factory');
const { parseWith } = require('../../utils/request.util');
const { signAndGenerateToken } = require('../../utils/auth.util');

const docClient = withProcessEnv(process.env)();
const repository = new UsersRepository(docClient);
const ok = withStatusCode(200, JSON.stringify);
const unAuthorized = withStatusCode(404);
const parseJson = parseWith(JSON.parse);

exports.handler = async (event) => {
  const { body } = event;
  const user = await parseJson(body);
  
  const dbUser = await repository.getByLoginId(user.email);
  if (!dbUser){
    return unAuthorized();
  }
  else{
    const valid = await bcrypt.compare(user.password, dbUser.password)
    if(!valid){
        return unAuthorized();
    }
  }
  const token = signAndGenerateToken(dbUser.Id, event);
  var responseToken = {
    "token": token
  };
  
  return ok(responseToken);
};
