const DOCUMENT_TABLE = process.env.DOCUMENT_TABLE;

class DocumentsRepository {
    get _baseParams() {
      return {
        TableName: DOCUMENT_TABLE
      };
    }
  
    constructor(documentClient) {
      this._documentClient = documentClient;
    }
  
    async list() {
      const params = this._createParamObject();
      const response = await this._documentClient.scan(params).promise();
  
      return response.Items || [];
    }
  
    async get(Id) {
      const params = this._createParamObject({ Key: { Id } });
      const response = await this._documentClient.get(params).promise();
  
      return response.Item;
    }
  
    async put(document) {
      const params = this._createParamObject({ Item: document });
      await this._documentClient.put(params).promise();
  
      return document;
    }
  
    async delete(id) {
      const params = this._createParamObject({ Key: { id } });
      await this._documentClient.delete(params).promise();
  
      return id;
    }
  
    _createParamObject(additionalArgs = {}) {
      return Object.assign({}, this._baseParams, additionalArgs);
    }
  }
  
  exports.DocumentsRepository = DocumentsRepository;