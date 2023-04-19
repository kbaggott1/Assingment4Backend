const express = require('express');
const router = express.Router();
const routeRoot = '*';

module.exports = {
    router,
    routeRoot
}

router.get(routeRoot, getError);
function getError(req, res) {
    res.sendStatus(404);
}