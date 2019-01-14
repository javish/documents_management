require('dotenv/config');

const uuid = require('uuid/v4');

const { DocumentsRepository } = require('../../repositories/documents.repository');
const { withStatusCode } = require('../../utils/response.util');
const { parseWith } = require('../../utils/request.util');
const { getUserId } = require('../../utils/auth.util');
const { withProcessEnv } = require('../../dynamodb.factory');

const docClient = withProcessEnv(process.env)();
const repository = new DocumentsRepository(docClient);
const created = withStatusCode(201);
const parseJson = parseWith(JSON.parse);

exports.handler = async (event) => {
  const { body } = event;
  const document = parseJson(body);
  document.Id = uuid();
  document.createdBy = getUserId(event);
  
  await repository.put(document);

  return created();
};