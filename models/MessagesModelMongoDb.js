//const dbName = "pokemon_db";
const {MongoClient, WriteConcernError} = require("mongodb");
const { InvalidInputError } = require('./InvalidInputError');
const { DatabaseError } = require('./DatabaseError');
const { checkValid, checkValidForEdit } = require("./validator");
const logger = require("../logger");
let client;
let messageCollection;

/**
 * Connects to mongodb database and creates a collection if one doesns't already exist
 * @param {*} dbName The name of the database.
 * @param {*} url The url to the mongodb.
 * @throws Database error if there was an issue connecting to the database
 */
async function initialize(url, dbName, reset = false) {
    try{
        //const url = process.env.URL_PRE + process.env.MONGODB_PWD + process.env.URL_POST;
        client = new MongoClient(url);

        await client.connect();
        logger.info("connected to db");
        let db = client.db(dbName);
        
        let collectionCursor = await db.listCollections({name: "messages" });
        let collectionArray = await collectionCursor.toArray();

        if(collectionArray.length == 0) {
            const collation = {locale: "en", strength: 1}
            await db.createCollection("messages", {collation: collation});
        }
        else {
            if(reset) {
                db.collection("messages").drop();

                const collation = {locale: "en", strength: 1}
                await db.createCollection("messages", {collation: collation});
            }
        }

        messageCollection = db.collection("messages");
    } catch(err) {
        logger.error("Could not initialize db: " + err.message);
        throw new DatabaseError("Could not initialize db: " + err.message);
    }
}

/**
 * Closes the database connection.
 */
async function close() {
    try {
        await client.close();
    }
    catch(err) {
        logger.error("Error closing database: " + err.message);
    }
}
/**
 * Adds a message to the messages collection
 * @param {*} messageId The messageId of the message. This must be unique.
 * @param {*} message The content of the message.
 * @param {*} user The author of the message.
 * @returns The message being added.
 * @throws InvalidInputError if messageId, message or user is not valid; Throws Database error.
 */
async function postMessage(messageId, message, user) {
    try {
        await checkValid(messageCollection, messageId, message, user);
        await messageCollection.insertOne({messageId: messageId, message: message, user: user});
        return {messageId: messageId, message: message, user: user};
    }
    catch(err) {
        logger.error(err.message)
        if(err instanceof InvalidInputError)
            throw new InvalidInputError(err.message);
        if(err instanceof WriteError)
            throw new DatabaseError(err.message);
        if(err instanceof WriteConcernError)
            throw new DatabaseError(err.message);

        throw new DatabaseError(err.message);
        
    }
}


/**
 * Gets a specific message from the messages collection.
 * @param {*} messageId The messageId of the message to receive.
 * @returns A message object containing messageId, message, and user.
 * @throws InvalidInputError if message was not found in the database; Throws database error.
 */
async function getMessageById(messageId) {
    try {
        let message = await messageCollection.findOne({messageId: messageId});

        if(message == null)
            throw new InvalidInputError("Could not find message with id: " + messageId);

        return message;
    }
    catch(err) {
        logger.error("Could not get messageId in model: " + err.message);
        if(err instanceof InvalidInputError)
            throw new InvalidInputError(err.message);
        else 
            throw new DatabaseError(err.message)
    }
    
}

/**
 * Gets an array of all messages sent by a specified user.
 * @param {*} user The author of the messages to retrieve.
 * @returns An array of message objects all posted from the user specified.
 * @throws Database Error when messages by user could not be found
 */
async function getMessagesByUser(user) {
    try {
        let messages = await messageCollection
            .find({user: user})
            .toArray();

        return messages;
    }
    catch(err) {
        logger.error("Could not get messages by user in model: " + err.message);
        throw new DatabaseError(err.message);
    }
}

/**
 * Gets all messages in the collection
 * @returns An array of all messages in the collection.
 * @throws DatabaseError if messages could not be retrieved.
 */
async function getAllMessages() {
    try {
        let messages = await messageCollection
            .find()
            .toArray();
        
        return messages;
    }
    catch(err) {
        logger.error("Could not get all messages in model: " + err.message);
        throw new DatabaseError(err.message);
    }
}

/**
 * Updates the content of a message.
 * @param {*} messageId The message id of the message to edit.
 * @param {*} newMessage The new message to replace the old one with.
 * @returns The new message content.
 * @throws InvalidInputError if messageId isn't in the database; throws Database error.
 */
async function editMessage(messageId, newMessage) {
    try {
        await checkValidForEdit(messageCollection, messageId, newMessage);
        await messageCollection.updateOne({messageId: messageId}, {$set: {message: newMessage}});
        return newMessage;
    }
    catch(err) {
        logger.error("Could not edit message in model: " + err.message);
        if(err instanceof InvalidInputError)
            throw new InvalidInputError(err.message);
        else
            throw new DatabaseError(err.message);
    }
}

/**
 * Deletes a specified message from the collection. If id doesn't exist nothing will be deleted.
 * @param {*} id The id of the message to delete.
 * @throws DatabaseError if message could not be deleted.
 */
async function deleteMessageById(id) {
    try {
        await messageCollection.deleteOne({messageId: id});
    }
    catch(err) {
        logger.error("Could not delete message in model: " + err.message);
        if(err instanceof WriteError)
            throw new DatabaseError(err.message);

        if(err instanceof WriteConcernError)
            throw new DatabaseError(err.message);

        throw new DatabaseError(err.message);
    }
}

/**
 * Only use for testing.
 * @returns The messages collection.
 */
function getCollection() {
    return messageCollection;
}

module.exports = {
    initialize,
    postMessage,
    getMessageById,
    getMessagesByUser,
    getAllMessages,
    editMessage,
    deleteMessageById,
    close,
    getCollection

}