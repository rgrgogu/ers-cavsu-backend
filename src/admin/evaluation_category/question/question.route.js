const express = require("express");
const router = express.Router();

const {
    GetQuestions,
    CreateQuestions,
    EditQuestions,
    ArchiveQuestions,
} = require("./question.controller");

const RequireAuth = require("../../../../global/middleware/RequireAuth");

router.get("/get_all_questions", RequireAuth, GetQuestions);
router.post("/create_question", RequireAuth, CreateQuestions);
router.put("/edit_question/:id", RequireAuth, EditQuestions);
router.put("/archive_question", RequireAuth, ArchiveQuestions);

module.exports = router;