const express = require("express");
const router = express.Router();

const {
    GetAllAdmissionGuide,
    GetCavsuInfo,
    GetERS,
    GetEvents,
    GetFAQGroup,
    GetFAQs,
    GetOfficials,
    GetHero
} = require("./public.controller");

router.get("/get_admissions", GetAllAdmissionGuide);
router.get("/get_info", GetCavsuInfo);
router.get("/get_ers", GetERS);
router.get("/get_events", GetEvents);
router.get("/get_faq_groups", GetFAQGroup);
router.get("/get_faqs/:id", GetFAQs);
router.get("/get_officials", GetOfficials);
router.get("/get_hero", GetHero);

module.exports = router;