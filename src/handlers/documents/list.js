require('dotenv/config');

const { DocumentsRepository } = require('../../repositories/documents.repository');
const { withStatusCode } = require('../../utils/response.util');
const { withProcessEnv } = require('../../dynamodb.factory');
const { getUserId } = require('../../utils/auth.util');

const docClient = withProcessEnv(process.env)();
const repository = new DocumentsRepository(docClient);
const ok = withStatusCode(200, JSON.stringify);
const unAuthorized = withStatusCode(404);

exports.handler = async (event) => {
  var userId = "";
  try{
    userId = await getUserId(event);
  }
  catch(err){
    console.error(err);
    return unAuthorized();
  }
  const documents = await repository.list(userId);

  return ok(documents);
};