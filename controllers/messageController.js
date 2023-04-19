const express = require('express');
const { DatabaseError } = require('../models/DatabaseError');
const { InvalidInputError } = require('../models/InvalidInputError');
const router = express.Router();
const routeRoot = '/messages';
const MessagesModelMongoDb = require("../models/MessagesModelMongoDb");
const logger = require("../logger");

module.exports = {
    router,
    routeRoot
}


router.post("/", createMessage);
/**
 * Called on post
 * @param {*} req Requests with body params: messageId, message, user
 * @param {*} res Resolves with status 200, 400, or 500
 * @throws InvalidInputError when input was not in a valid format; Throws Database Error.
 */
async function createMessage(req, res) { 
    try {
        let message = await MessagesModelMongoDb.postMessage(req.body.messageId, req.body.message, req.body.user);
        if(message) {
            res.status("200");
            res.send("Successfully added message: "+message.message+".");
        }
        else {
            res.status("400");
            res.send("Could not add message to database.");
            logger.error("Could not add message in controller.");
        }
    }
    catch(err) {
        if(err instanceof DatabaseError) {
            res.status("500");
            res.send("Database Error trying to add message");
            logger.error("Database Error trying to add message in controller: "+err.message);
        }
        else 
        if(err instanceof InvalidInputError) {
            res.status("400");
            res.send("Invalid input, cant add message");
            logger.error("Invalid input trying to add message: "+err.message);
        }
        else {
            res.status("500");
            res.send("Error trying to add message");
            logger.error("Error try to add in controller: "+err.message);
        }
    }
}

router.get("/", getMessages)
/**
 * Called on get to retrieve all messages
 * @param {*} req Request no params required
 * @param {*} res Responds with all messages via json. Resovles with status 200 or 500.
 * @throw InvalidInputError and DatabaseError
 */
async function getMessages(req, res) {
    try {
        let messages = await MessagesModelMongoDb.getAllMessages();

        res.status("200");
        res.json(messages);
        
    }
    catch(err) {
        if(err instanceof DatabaseError) {
            res.status("500");
            res.send("Database Error trying to get messages");
            logger.error("Database Error trying to get all messages in controller: "+err.message);
        }
        else {
            res.status("500");
            res.send("Error trying to get messages");
            logger.error("Error trying to get all messages in controller: "+err.message);
        }
    }
}


router.get("/:id", getMessage);
/**
 * Called on get with message id
 * @param {*} req Requests with parameter: id
 * @param {*} res Resolves with status 200, 400 or 500.
 * @throws InvalidInputError and DatabaseError
 */
async function getMessage(req, res) {
    try {
        let message = await MessagesModelMongoDb.getMessageById(req.params.id);

        if(message) {
            res.status("200");
            res.send("message Found: \""+message.message+"\" sent by: "+message.user);
        } else {
            res.status("400");
            res.send("Unable to find message");
            logger.error("Unable to find message in controller");
        }
    }
    catch(err) {
        if(err instanceof DatabaseError) {
            res.status("500");
            res.send("Database Error trying to get message");
            logger.error("Database Error trying to get in controller: "+err.message);
        }
        else
        if(err instanceof InvalidInputError) {
            res.status("400");
            res.send("Can't find message");
            logger.error("Invalid input trying to get message: "+err.message);
        }
        else {
            res.status("500");
            res.send("Error trying to get message");
            logger.error("Error trying to get message in controller: "+err.message);
        }
    }
}


router.put("/", updateMessage);
/**
 * Called on put to update a message
 * @param {*} req Requests with body parameters: messageId, message
 * @param {*} res Resolves with status 200, 400 or 500.
 * @throws InvalidInputError and DatabaseError.
 */
async function updateMessage(req, res) {
    try {
        let message = await MessagesModelMongoDb.editMessage(req.body.messageId, req.body.message);
        if(message) {
            res.status("200");
            res.send("Successfully edited message: "+message+".");
        }
        else {
            res.status("400");
            res.send("Could not edit message to database.");
            logger.error("Could not edit message in controller.");
        }
    }
    catch(err) {
        if(err instanceof DatabaseError) {
            res.status("500");
            res.send("Database Error trying to edit message");
            logger.error("Database Error trying to edit message in controller: "+err.message);
        }
        else 
        if(err instanceof InvalidInputError) {
            res.status("400");
            res.send("Invalid input, cant edit message");
            logger.error("Invalid input trying to edit message: "+err.message);
        }
        else {
            res.status("500");
            res.send("Error trying to edit message");
            logger.error("Error trying to edit in controller: "+err.message);
        }
    }
}

router.delete("/", deleteMessage);
/**
 * Called on delete to delete a messsage by id
 * @param {*} req Requests body parameter: messageId
 * @param {*} res Resolves with status 200 or 500.
 * @throws InvalidInputError and DatabaseError.
 */
async function deleteMessage(req, res) {
    try {
        await MessagesModelMongoDb.deleteMessageById(req.body.messageId);
        res.status("200");
        res.send("Deleted pokemon of id: " + req.body.messageId);
    }
    catch(err) {
        if(err instanceof DatabaseError) {
            res.status("500");
            res.send("Database Error trying to delete message");
            logger.error("Database Error trying to delete in controller: "+err.message);
        }
        else {
            res.status("500");
            res.send("Error trying to delete message");
            logger.error("Error trying to delete message in controller: "+err.message);
        }
    }
}