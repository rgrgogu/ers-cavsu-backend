const express = require("express");
const router = express.Router();
const StudentController = require("./controller");

const RequireAuth = require("../../../global/middleware/RequireAuth")

router.get("/", RequireAuth, StudentController.GetStudentsBySection);

module.exports = router;