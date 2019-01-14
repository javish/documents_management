const USER_TABLE = process.env.USER_TABLE;

class UsersRepository {
    get _baseParams() {
      return {
        TableName: USER_TABLE
      };
    }
  
    constructor(documentClient) {
      this._documentClient = documentClient;
    }
  
    async getByLoginId(Id) {
        const params = this._createParamObject({ Key: { loginId: Id } });
        const response = await this._documentClient.get(params).promise();
    
        return response.Item;
    }

    async get(Id) {
      const params = this._createParamObject({ Key: { Id } });
      const response = await this._documentClient.get(params).promise();
  
      return response.Item;
    }
  
    async put(user) {
      const params = this._createParamObject({ Item: user });
      await this._documentClient.put(params).promise();
  
      return user;
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
  
  exports.UsersRepository = UsersRepository;