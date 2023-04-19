const app = require("./app"); 
const supertest = require("supertest");
const testRequest = supertest(app); 
const logger = require("./logger");

require("dotenv").config();
const { MongoMemoryServer } = require("mongodb-memory-server");
let model = require("./models/MessagesModelMongoDb.js");
jest.setTimeout(500000);
let mongodb;

let messageData;

const generateMessageData = () => messageData.splice(Math.floor(Math.random() * messageData.length), 1)[0];

beforeAll(async () => {
    try {
        mongodb = await MongoMemoryServer.create();
        logger.info("Mock db started.");
    } catch(err) {
        logger.error(err.message);
    }
        
})

beforeEach(async () => {
    try {
        const url = mongodb.getUri();
        await model.initialize(url, "message_db_test", true);

        messageData = [
            {messageId: "1", message: "Hello world!", user: "littlewalter262"},
            {messageId: "2", message: "Deedle dee", user: "Jxsh"},
            {messageId: "3", message: "Whats up dude...", user: "Kmoney"},
            {messageId: "4", message: "Only take W's", user: "thelegend27"},
            {messageId: "5", message: "Good evening", user: "Shawn"},
            {messageId: "6", message: "Javascript is pain", user: "puddingting"},
            {messageId: "7", message: "I have a black dog", user: "david"},
            {messageId: "8", message: "Hello world!", user: "RenGuy"},
            {messageId: "9", message: "Hello world times 2!", user: "Rsef"}
        ]
    }
    catch(err) {
        logger.error("Could not initialize db in test: "+err.message);
    }
});

afterEach(async () => {
    try {
        await model.close();
    }
    catch(err) {
        logger.error(err.message);
    }
});

afterAll(async () => {
    try {
        await mongodb.stop();
        logger.info("Mock db stopped.");
    }
    catch(err) {
        logger.error(err.message);
    }
})

test("POST /messages success case", async () => {
    let message = generateMessageData();
    const testResponse = await testRequest.post('/messages').send({
        messageId: message.messageId,
        message: message.message,
        user: message.user
    })

    const cursor = await model.getCollection().find();
    const results = await cursor.toArray();

    expect(testResponse.status).toBe(200);
    expect(results.length).toBe(1);
    expect(results[0].user).toBe(message.user);
    expect(results[0].message).toBe(message.message);
    expect(results[0].messageId).toBe(message.messageId);
});
    
//create
test("POST /messages 400 fail case", async () => {
    let message = generateMessageData();
    const testResponse = await testRequest.post('/messages').send({
        messageId: "not a number",
        message: message.message,
        user: message.user
    })
    expect(testResponse.status).toBe(400);
});

test("POST /messages 500 fail case", async () => {
    let message = generateMessageData();
    model.close();
    const testResponse = await testRequest.post('/messages').send({
        messageId: message.messageId,
        message: message.message,
        user: message.user
    })
    expect(testResponse.status).toBe(500);

});
    
//read
test("GET /messages/:id 400 fail case", async () => {
    let message = generateMessageData();
    await model.getCollection().insertOne({messageId: message.messageId, message: message.message, user: message.user});
    const testResponse = await testRequest.get('/messages/' + 800);
    expect(testResponse.status).toBe(400);

});
    
test("GET /messages/:id 500 fail case", async () => {
    let message = generateMessageData();
    await model.getCollection().insertOne({messageId: message.messageId, message: message.message, user: message.user});
    model.close();
    const testResponse = await testRequest.get('/messages/' + message.messageId);
    expect(testResponse.status).toBe(500);

});
    
test("GET /messages/:id success case", async () => {
    let message = generateMessageData();
    await model.getCollection().insertOne({messageId: message.messageId, message: message.message, user: message.user});
    const testResponse = await testRequest.get('/messages/' + message.messageId);
    expect(testResponse.status).toBe(200);

});

test("GET /messages/ success case", async () => {
    let message = generateMessageData();
    let message2 = generateMessageData();
    let message3 = generateMessageData();
    await model.getCollection().insertOne({messageId: message.messageId, message: message.message, user: message.user});
    await model.getCollection().insertOne({messageId: message2.messageId, message: message2.message, user: message2.user});
    await model.getCollection().insertOne({messageId: message3.messageId, message: message3.message, user: message3.user});

    
    
    const testResponse = await testRequest.get('/messages/');
    //const testResponse = await JSON.parse(jsonResponse).toArray();

    expect(testResponse.status).toBe(200);
    expect(testResponse.body.length).toBe(3);
    expect(testResponse.body[0].messageId).toBe(message.messageId);
    expect(testResponse.body[0].message).toBe(message.message);
    expect(testResponse.body[0].user).toBe(message.user);

    expect(testResponse.body[1].messageId).toBe(message2.messageId);
    expect(testResponse.body[1].message).toBe(message2.message);
    expect(testResponse.body[1].user).toBe(message2.user);

    expect(testResponse.body[2].messageId).toBe(message3.messageId);
    expect(testResponse.body[2].message).toBe(message3.message);
    expect(testResponse.body[2].user).toBe(message3.user);

});

test("GET /messages/ 500 fail case", async () => {
    let message = generateMessageData();
    let message2 = generateMessageData();
    let message3 = generateMessageData();
    await model.getCollection().insertOne({messageId: message.messageId, message: message.message, user: message.user});
    await model.getCollection().insertOne({messageId: message2.messageId, message: message2.message, user: message2.user});
    await model.getCollection().insertOne({messageId: message3.messageId, message: message3.message, user: message3.user});

    
    model.close();
    const testResponse = await testRequest.get('/messages/');

    expect(testResponse.status).toBe(500);

});

//update
test("PUT /messages/ success case", async () => {
    let message = generateMessageData();
    let newMessage = "this is a new message";
    await model.getCollection().insertOne({messageId: message.messageId, message: message.message, user: message.user });


    const testResponse = await testRequest.put('/messages').send({
        messageId: message.messageId,
        message: newMessage,
    })

    const cursor = await model.getCollection().find();
    const results = await cursor.toArray();

    expect(testResponse.status).toBe(200);
    expect(results.length).toBe(1);
    expect(results[0].user).toBe(message.user);
    expect(results[0].message).toBe(newMessage);
    expect(results[0].messageId).toBe(message.messageId);
});

test("PUT /messages/ 500 fail case", async () => {
    let message = generateMessageData();
    let newMessage = "this is a new message";
    await model.getCollection().insertOne({messageId: message.messageId, message: message.message, user: message.user });

    model.close();

    const testResponse = await testRequest.put('/messages').send({
        messageId: message.messageId,
        message: newMessage,
    })

    expect(testResponse.status).toBe(500);
});

test("PUT /messages/ 400 fail case", async () => {
    let message = generateMessageData();
    let newMessage = "This is new";
    let badId = "not a number;"
    await model.getCollection().insertOne({messageId: message.messageId, message: message.message, user: message.user });

    const testResponse = await testRequest.put('/messages').send({
        messageId: badId,
        message: newMessage,
    })

    expect(testResponse.status).toBe(400);
});

//delete
test("DELETE /messages/:id success case", async () => {
    let message = generateMessageData();
    let message2 = generateMessageData();
    let message3 = generateMessageData();
    await model.getCollection().insertOne({messageId: message.messageId, message: message.message, user: message.user });
    await model.getCollection().insertOne({messageId: message2.messageId, message: message2.message, user: message2.user });
    await model.getCollection().insertOne({messageId: message3.messageId, message: message3.message, user: message3.user });


    const testResponse = await testRequest.delete('/messages/' + message.messageId);

    const cursor = await model.getCollection().find();
    const results = await cursor.toArray();

    expect(testResponse.status).toBe(200);
    expect(results.length).toBe(2);
    expect(results[0].user).toBe(message2.user);
    expect(results[0].message).toBe(message2.message);
    expect(results[0].messageId).toBe(message2.messageId);

    expect(results[1].user).toBe(message3.user);
    expect(results[1].message).toBe(message3.message);
    expect(results[1].messageId).toBe(message3.messageId);

});

test("DELETE /messages/:id 500 fail case", async () => {
    let message = generateMessageData();
    let message2 = generateMessageData();
    let message3 = generateMessageData();
    await model.getCollection().insertOne({messageId: message.messageId, message: message.message, user: message.user });
    await model.getCollection().insertOne({messageId: message2.messageId, message: message2.message, user: message2.user });
    await model.getCollection().insertOne({messageId: message3.messageId, message: message3.message, user: message3.user });

    model.close();
    const testResponse = await testRequest.delete('/messages/' + message.messageId);

    expect(testResponse.status).toBe(500);
});


