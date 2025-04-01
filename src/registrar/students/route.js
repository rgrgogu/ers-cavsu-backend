const express = require("express");
const router = express.Router();
const StudentController = require("./controller");

const RequireAuth = require("../../../global/middleware/RequireAuth")

router.get("/get_new_firstyear", RequireAuth, StudentController.get_new_firstyear);

module.exports = router;