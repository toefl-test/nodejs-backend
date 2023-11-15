module.exports = app => {
    const accounts = require("../controller/account.controller.js");
    var guard = require('express-jwt-permissions')()

    var router = require("express").Router();

    router.post("/register", accounts.register);

    router.post("/registerEmail", accounts.registerEmail);

    router.post("/login", accounts.login);

    router.post("/resend-verification", accounts.resendVerificationEmail);

    router.get('/verify-email/:token', accounts.verifyEmail)

    router.get("/checkEmailExistence", accounts.checkEmailExistence);

    router.get("/image/:email", accounts.image);

    router.get("/all", accounts.all);

    router.get("/allHtml", accounts.allHtml);

    router.get("/delete", accounts.allHtml);

    router.get("/checkDateAvailability", accounts.checkDateAvailability);

    router.get("/getAllDateAvailability", accounts.getAllDateAvailability);

    // router.get("/all", accounts.findAll);

    // router.get("/published", accounts.findAllPublished);

    // router.get("/:id", accounts.findOne);

    // router.put("/:id", accounts.update);

    // router.delete("/:id", accounts.delete);

    app.use('/account', router);
};