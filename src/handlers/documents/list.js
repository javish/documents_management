require('dotenv/config');

const { DocumentsRepository } = require('../../repositories/documents.repository');
const { withStatusCode } = require('../../utils/response.util');
const { withProcessEnv } = require('../../dynamodb.factory');

const docClient = withProcessEnv(process.env)();
const repository = new DocumentsRepository(docClient);
const ok = withStatusCode(200, JSON.stringify);

exports.handler = async (event) => {
  const documents = await repository.list();

  return ok(documents);
};