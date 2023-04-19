const express = require('express');
const app = express();
const logger = require('./logger');
const pinohttp = require('pino-http');
const httpLogger = pinohttp({
    logger: logger
});
const bodyParser = require("body-parser");
const cors = require("cors");


// Make sure errorController is last!
const controllers = ['homeController', 'messageController','errorController'] 
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(httpLogger);

// Register routes from all controllers 
//  (Assumes a flat directory structure and common 
 // 'routeRoot' / 'router' export)
controllers.forEach((controllerName) => {
    try {
        const controllerRoutes = require('./controllers/' + controllerName);
        app.use(controllerRoutes.routeRoot, 
                controllerRoutes.router);
    } catch (error) {      
       logger.error("Could not find all controllers in app: " + error.message);
       throw error; // We could fail gracefully, but this 
		//  would hide bugs later on.
    }    
})

const listEndpoints = require('express-list-endpoints');
console.log(listEndpoints(app));

module.exports = app
