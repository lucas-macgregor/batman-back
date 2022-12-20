const logger = require("../logger");
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'clavesecreta1234';

function extractTokenInfo(token) {
    let decode;
    if (token!==undefined) {
        try {
            decode = jwt.verify(token,SECRET_KEY);
        } 
        catch ( error ) {
            logger.error(`JWT Validation error: ${error}`);
            decode=null;
        }
        if (decode!== null){
            return {username: decode.username, email: decode.email};
        }
        else
            return false;
        
    } else 
        return false;
}

function validateJWT(token) {
    let decode;
    if (token!==undefined) {
        try {
            decode = jwt.verify(token,SECRET_KEY);
        } 
        catch ( error ) {
            logger.error(`JWT Validation error: ${error}`);
            decode=null;
        }
        if (decode!== null){
            return true;
        }
        else
            return false;
        
    } else 
        return false;
}

module.exports={extractTokenInfo, validateJWT};