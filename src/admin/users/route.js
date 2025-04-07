const express = require("express");
const router = express.Router();
const UserController = require("./controller");

const RequireAuth = require("../../../global/middleware/RequireAuth")

router.get("/admins", RequireAuth, UserController.listAdmins);
router.get("/admissions", RequireAuth, UserController.listAdmissions);
router.get("/applicants", RequireAuth, UserController.listApplicants);
router.get("/faculty", RequireAuth, UserController.listFaculty);
router.get("/registrars", RequireAuth, UserController.listRegistrars);
router.get("/students", RequireAuth, UserController.listStudents);

router.post("/applicants", RequireAuth, UserController.massCreateStudents);
router.post("/create", RequireAuth, UserController.CreateAccount);

module.exports = router;