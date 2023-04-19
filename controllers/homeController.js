const express = require('express');
const router = express.Router();
const routeRoot = '/';

module.exports = {
    router,
    routeRoot
}


router.get(routeRoot, getHome);
router.get(routeRoot+"home", getHome);
function getHome(req, res) {
    res.send("Welcome to my web page.");
}