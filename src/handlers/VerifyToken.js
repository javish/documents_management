
const { getUserId } = require('../../utils/auth.util');
const { withStatusCode } = require('../../utils/response.util');

const badRequest = withStatusCode(400);

module.exports.verify = async (event) => {
    const userId = getUserId(event);
    if(!userId){
        return badRequest();
    }
};