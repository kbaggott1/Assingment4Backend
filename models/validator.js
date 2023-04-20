const validator = require("validator");
const { DatabaseError } = require("./DatabaseError");
const {InvalidInputError} = require("./InvalidInputError");
const logger = require("../logger");

/**
 * Checks if id exists in the collection, and the message is valid. 
 * Does not return anything. Will throw if message or id is invalid.
 * @param {*} collection The collection to check for matching message id.
 * @param {*} id The id of the message to validate.
 * @param {*} message The message to validate.
 * @throws InvalidInputError and DatabaseError
 */
async function checkValidForEdit(collection, id, message) {
    try {
        if(!validator.isNumeric(id.toString()))
            throw new InvalidInputError("Invalid id: " + id + ". Ids must be numeric.");

        if((await isMessageIdUnique(collection, id)))
            throw new InvalidInputError("Message id: " + id + " does not exist.");

        checkMessage(message);
    }
    catch(err) {
        logger.error(err.message);
        if(err instanceof InvalidInputError)
            throw new InvalidInputError(err.message);
        else 
            throw new DatabaseError(err.message);
    }
}

/**
 * Checks for a unique message id, a valid message, and a valid username.
 * Does not return anything. Will throw if message or id is invalid.
 * @param {*} collection The collection to check for matching message id.
 * @param {*} id The message id to validate.
 * @param {*} message The message to validate.
 * @param {*} user The username to validate.
 * @throws InvalidInputError and DatabaseError
 */
async function checkValid(collection, id, message, user) {
    try {
        await checkId(collection, id);
        checkMessage(message);
        checkUser(user);
    }
    catch(err) {
        logger.error(err.message);
        if(err instanceof InvalidInputError)
            throw new InvalidInputError(err.message);
        else
            throw new DatabaseError(err.message);
    }
}


/**
 * Checks for valid message id. Will throw if id isn't numeric or unique.
 * @param {*} collection The collection to check for a unique id.
 * @param {*} id The id to be validated.
 * @throws InvalidInputError and DatabaseError
 */
async function checkId(collection, id) {
        //id should be numeric
    try {
        if(!validator.isNumeric(id.toString()))
            throw new InvalidInputError("Invalid id: " + id + ". Ids must be numeric.");

        //should throw becuase there should not be duplicates
        if(! (await isMessageIdUnique(collection, id)))
            throw new InvalidInputError("Message id: " + id + " already exists.");
    }
    catch(err) {
        logger.error(err.message);
        if(err instanceof InvalidInputError)
            throw new InvalidInputError(err.message);    
        else
            throw new DatabaseError(err.message);
    }

}

/**
 * Checks for valid message. Message can't be empty or more than 500 characters.
 * @param {*} message The message to be validated.
 * @throws InvalidInputError
 */
function checkMessage(message) {
    const MAX_CHAR = 500;

    if(!message) {
        throw new InvalidInputError("Message cannot be empty");
    }

    if(message.length == 0) {
        throw new InvalidInputError("Message cannot be empty");
    }

    if(message.length > MAX_CHAR) {
        throw new InvalidInputError("Message is over the character limit of " + MAX_CHAR);
    }
}

/**
 * Checks if username is alphanumeric.
 * @param {*} user The username to be validated.
 * @throws InvalidInputError
 */
function checkUser(user) {
    if(!user) {
        throw new InvalidInputError("user cannot be empty");
    }

    if(!validator.isAlphanumeric(user))
        throw new InvalidInputError("Illegal characters in username: " + user);
}

/**
 * Checks if message id is unique. 
 * @param {*} collection The collection to check for the existing id.
 * @param {*} id The id to search for.
 * @returns True if message is unique, false if message isn't unique. 
 * @throws DatabaseError
 */
async function isMessageIdUnique(collection, id) {
    try {
        let message = await collection.findOne({messageId: id});

        if(message == null)
            return true;

        return false;
    }
    catch(err) {
        throw new DatabaseError("Could not check if id is in database: " + err.message);
    }

}

module.exports = {checkValid, checkValidForEdit};