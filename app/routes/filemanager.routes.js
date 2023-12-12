module.exports = app => {
    const filemanager = require("../controller/filemanager.controller");
    var guard = require('express-jwt-permissions')()

    var router = require("express").Router();

    router.get("/agreement/:id", filemanager.agreement);

    router.get("/signature", filemanager.signature);

    app.use('/filemanager', router);
};