const express = require("express");
const router = express.Router();
const UserController = require("./controller");

router.get("/admins", UserController.listAdmins);
router.post("/admins", UserController.createAdmin);

router.get("/admissions", UserController.listAdmissions);
router.post("/admissions", UserController.createAdmission);

router.get("/applicants", UserController.listApplicants);
router.post("/applicants", UserController.createApplicant);

router.get("/faculty", UserController.listFaculty);
router.post("/faculty", UserController.createFaculty);

router.get("/registrars", UserController.listRegistrars);
router.post("/registrars", UserController.createRegistrar);

router.get("/students", UserController.listStudents);
router.post("/students", UserController.createStudent);

module.exports = router;