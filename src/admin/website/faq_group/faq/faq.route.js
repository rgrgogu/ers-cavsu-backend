const express = require("express");
const router = express.Router();

const {
    GetFAQs,
    CreateFAQ,
    EditFAQ,
    ArchiveFAQ,
} = require("./faq.controller");

const RequireAuth = require("../../../../../global/middleware/RequireAuth");

router.get("/get_all_faqs", RequireAuth, GetFAQs);
router.post("/create_faq", RequireAuth, CreateFAQ);
router.put("/edit_faq/:id", RequireAuth, EditFAQ);
router.put("/archive_faq", RequireAuth, ArchiveFAQ);

module.exports = router;