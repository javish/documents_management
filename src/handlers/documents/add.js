require('dotenv/config');

const moment = require('moment');
const uuid = require('uuid/v4');

const { DocumentsRepository } = require('../../repositories/documents.repository');
const { withStatusCode } = require('../../utils/response.util');
const { parseWith } = require('../../utils/request.util');
const { getUserId } = require('../../utils/auth.util');
const { withProcessEnv } = require('../../dynamodb.factory');

const docClient = withProcessEnv(process.env)();
const repository = new DocumentsRepository(docClient);
const created = withStatusCode(201);
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
  
  const { body } = event;
  const document = parseJson(body);
  document.Id = uuid();
  document.createdOn = moment().format("YYYY-MM-DDTHH:mm:ss");
  document.createdBy = userId;
  
  await repository.put(document);

  return created();
};