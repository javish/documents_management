require('dotenv/config');

const moment = require('moment');

const { DocumentsRepository } = require('../../repositories/documents.repository');
const { withStatusCode } = require('../../utils/response.util');
const { parseWith } = require('../../utils/request.util');
const { getUserId } = require('../../utils/auth.util');
const { withProcessEnv } = require('../../dynamodb.factory');

const docClient = withProcessEnv(process.env)();
const repository = new DocumentsRepository(docClient);
const ok = withStatusCode(200);
const notFound = withStatusCode(400);
const unAuthorized = withStatusCode(404);
const parseJson = parseWith(JSON.parse);

exports.handler = async (event) => {
  var userId = "";
  try{
    userId = await getUserId(event);
  }
  catch(err){
    console.error(err);
    return unAuthorized();
  }
  const { body, pathParameters } = event;
  const { id } = pathParameters;

  const existingDocument = await repository.get(id);
  const document = parseJson(body);
  document.updatedBy = userId;
  document.updatedOn = moment();
  
  if (!existingDocument) {
    return notFound();
  }

  if (existingDocument.id !== document.id) {
    return notFound();
  }

  await repository.put(document);

  return ok();
};