module.exports = app => {
    const accounts = require("../controller/account.controller.js");
    const exams = require("../controller/exam.controllor.js");
    var guard = require('express-jwt-permissions')()

    var router = require("express").Router();

    router.post("/register", accounts.register);

    router.post("/registerEmail", accounts.registerEmail);

    router.post("/login", accounts.login);

    router.post("/resend-verification", accounts.resendVerificationEmail);

    router.get('/verify-email/:token', accounts.verifyEmail)

    router.get("/checkEmailExistence", accounts.checkEmailExistence);

    router.get("/image/:id", accounts.image);

    router.get("/all", accounts.all);

    router.get("/allHtml", accounts.allHtml);

    router.get("/delete", accounts.allHtml);

    router.get("/checkDateAvailability", accounts.checkDateAvailability);

    router.get("/getAllDateAvailability", accounts.getAllDateAvailability);

    router.post("/uploadImage", accounts.uploadImage);

    router.post("/registerExam", exams.registerExam);

    router.get("/profile/:id", accounts.profile);

    router.post("/updateProfile/:id", accounts.updateProfile);

    // router.get("/all", accounts.findAll);

    // router.delete("/:id", accounts.delete);

    app.use('/account', router);
};