const express = require("express");
const router = express.Router();

const {
    GetFAQs,
    CreateFAQ,
    EditFAQ,
    ArchiveFAQ,
} = require("./events.controller");

const upload = require("../../../../global/config/Multer");
const RequireAuth = require("../../../../global/middleware/RequireAuth");

router.get("/get_all_faqs", RequireAuth, GetFAQs);
router.post("/create_faq", RequireAuth, CreateFAQ);
router.put("/edit_faq/:id", RequireAuth, EditFAQ);
router.put("/archive_faq/:id", RequireAuth, ArchiveFAQ);

module.exports = router;