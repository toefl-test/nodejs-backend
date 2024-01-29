const {verifyAdminToken, verifyToken} = require("../services/auth.service");
const exams = require("../controller/exam.controllor.js");
module.exports = app => {
    const controller = require("../controller/admin.controller.js");

    let router = require("express").Router();
  
    // Create a new Tutorial
    router.get("/allAccounts", verifyAdminToken, controller.getAllUsers);
    router.post("/updateAccount", verifyAdminToken, controller.updateAccountTable);
    router.post("/deleteAnyItem", verifyAdminToken, controller.deleteAnyRow);
    router.post("/updateAnyItem", verifyAdminToken, controller.updateAnyRow);
    router.post("/addAnyItem", verifyAdminToken, controller.addAnyRow);
    router.post("/allAnyTable", verifyAdminToken, controller.allAnyTable);
    router.get("/getExamsByUser/:id", verifyAdminToken, exams.getAllExamsForUser);
    router.get("/getAllAccountsForExam/:id", verifyAdminToken, exams.getAllAccountsForExam);
    router.post("/updateScores", verifyAdminToken, exams.updateScores);
    app.use('/admin', router);
};