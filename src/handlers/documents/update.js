require('dotenv/config');

const { DocumentsRepository } = require('../../repositories/documents.repository');
const { withStatusCode } = require('../../utils/response.util');
const { parseWith } = require('../../utils/request.util');
const { withProcessEnv } = require('../../dynamodb.factory');

const docClient = withProcessEnv(process.env)();
const repository = new DocumentsRepository(docClient);
const ok = withStatusCode(200);
const badRequest = withStatusCode(400);
const notFound = withStatusCode(404);
const parseJson = parseWith(JSON.parse);

exports.handler = async (event) => {
  const { body, pathParameters } = event;
  const { id } = pathParameters;

  const existingDocument = await repository.get(id);
  const document = parseJson(body);

  if (!existingDocument) {
    return notFound();
  }

  if (existingDocument.id !== document.id) {
    return badRequest();
  }

  await repository.put(document);

  return ok();
};