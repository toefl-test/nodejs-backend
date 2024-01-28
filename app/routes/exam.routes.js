const {verifyToken} = require("../services/auth.service");
const exams = require("../controller/exam.controllor.js");
module.exports = app => {

    let router = require("express").Router();

    router.get("/getExamsByUser", verifyToken, exams.getAllExamsForUser);
    app.use('/exam', router);
};