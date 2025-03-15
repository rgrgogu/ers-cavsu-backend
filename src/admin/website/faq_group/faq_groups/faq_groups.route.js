const express = require("express");
const router = express.Router();

const {
    GetFAQGroups,
    CreateFAQGroup,
    EditFAQGroup,
    ArchiveFAQGroup,
} = require("./faq_groups.controller");

const RequireAuth = require("../../../../../global/middleware/RequireAuth");

router.get("/get_all_faqgroups", RequireAuth, GetFAQGroups);
router.post("/create_faqgroup", RequireAuth, CreateFAQGroup);
router.put("/edit_faqgroup/:id", RequireAuth, EditFAQGroup);
router.put("/archive_faqgroup", RequireAuth, ArchiveFAQGroup);

module.exports = router;