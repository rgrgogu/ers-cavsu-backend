const express = require("express");
const router = express.Router();

const {
    GetQuestions,
} = require("./question.controller");

const RequireAuth = require("../../../../global/middleware/RequireAuth");

router.get("/get_all_questions", RequireAuth, GetQuestions);

module.exports = router;