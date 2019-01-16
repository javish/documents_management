require('dotenv/config');

const { DocumentsRepository } = require('../../repositories/documents.repository');
const { withStatusCode } = require('../../utils/response.util');
const { withProcessEnv } = require('../../dynamodb.factory');
const { getUserId } = require('../../utils/auth.util');

const docClient = withProcessEnv(process.env)();
const repository = new DocumentsRepository(docClient);
const noContent = withStatusCode(204);
const unAuthorized = withStatusCode(404);

exports.handler = async (event) => {
  try{
    await getUserId(event);
  }
  catch(err){
    console.error(err);
    return unAuthorized();
  }
  const { id } = event.pathParameters;

  await repository.delete(id);

  return noContent();
};