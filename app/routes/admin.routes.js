const {verifyAdminToken} = require("../services/auth.service");
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
    app.use('/admin', router);
};