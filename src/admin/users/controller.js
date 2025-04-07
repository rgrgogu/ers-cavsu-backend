const AuthLogin = require("../../auth/login/model");
const ProfileTwo = require("../../auth/profile_two/model");
const BCrypt = require("../../../global/config/BCrypt")
const NotificationController = require("../../applicant/app_notification/notification.controller")
const { CreateFolder } = require("../../../global/utils/Drive")

const rolePrefixes = {
  admission: { prefix: 'AD', folder: process.env.ADMISSION_GDRIVE_FOLDER },
  faculty: { prefix: 'FT', folder: process.env.FACULTY_GDRIVE_FOLDER },
  registrar: { prefix: 'RG', folder: process.env.REGISTRAR_GDRIVE_FOLDER },
  admin: { prefix: 'AM', folder: process.env.ADMIN_GDRIVE_FOLDER },
};

// UserController
const UserController = {
  // List all Admin users
  listAdmins: async (req, res) => {
    try {
      const admins = await AuthLogin.find({ isArchived: false, role: "admin" })
        .select("-password") // Exclude password from response
        .sort({ createdAt: -1 });
      res.json(admins);
    } catch (error) {
      res.status(400).json({ message: "Error fetching admins", error: error.message });
    }
  },

  // List all Admission users
  listAdmissions: async (req, res) => {
    try {
      const admissions = await AuthLogin.find({ isArchived: false, role: "admission" })
        .select("-password")
        .sort({ createdAt: -1 });
      res.json(admissions);
    } catch (error) {
      res.status(400).json({ message: "Error fetching admissions", error: error.message });
    }
  },

  // List all Applicants/Students
  listApplicants: async (req, res) => {
    try {
      const applicants = await AuthLogin.find({ isArchived: false, role: "applicant" })
        .populate('profile_id_one', 'application_details')
        .select("-password")

      res.json(applicants);
    } catch (error) {
      res.status(400).json({ message: "Error fetching applicants", error: error.message });
    }
  },

  // List all Faculty users
  listFaculty: async (req, res) => {
    try {
      const faculty = await AuthLogin.find({ isArchived: false, role: "faculty" })
        .select("-password")
        .sort({ createdAt: -1 });
      res.json(faculty);
    } catch (error) {
      res.status(400).json({ message: "Error fetching faculty", error: error.message });
    }
  },

  // List all Registrar users
  listRegistrars: async (req, res) => {
    try {
      const registrars = await AuthLogin.find({ isArchived: false, role: "registrar" })
        .select("-password")
        .sort({ createdAt: -1 });
      res.json(registrars);
    } catch (error) {
      res.status(400).json({ message: "Error fetching registrars", error: error.message });
    }
  },

  // List all Students
  listStudents: async (req, res) => {
    try {
      const students = await AuthLogin.find({ isArchived: false, role: "student" })
        .select("-password")
        .sort({ createdAt: -1 })
        .populate('program')
        .populate('updated_by');
      res.json(students);
    } catch (error) {
      res.status(400).json({ message: "Error fetching students", error: error.message });
    }
  },

  // Create Account for Admin, Admission, Faculty, and Registrar
  CreateAccount: async (req, res) => {
    try {
      const { role } = req.body;

      // Validate role
      if (!role || !rolePrefixes[role]) {
        return res.status(400).json({ error: 'Invalid or missing role.' });
      }

      // Extract prefix and folder from rolePrefixes
      const { prefix, folder } = rolePrefixes[role];
      if (!prefix) {
        return res.status(400).json({ error: 'Role prefix is missing.' });
      }

      // Generate user_id
      const count = await AuthLogin.countDocuments({ role }) + 1;
      const year = new Date().getFullYear();
      const paddedCount = count.toString().padStart(6, '0');
      const user_id = `${prefix}${year}${paddedCount}`;

      // Assign default values for username and password
      const username = user_id;
      const password = await BCrypt.hash(process.env.DEFAULT_PASS);

      // Combine full name
      const fullName = [req.body.name.firstname, req.body.name.middlename, req.body.name.lastname, req.body.name.extension]
        .filter(Boolean)
        .join(' ');

      // Create user in the database
      const user = await AuthLogin.create({ ...req.body, username, password, user_id });

      // Use the folder from rolePrefixes or fallback to a default folder
      const folder_id = await CreateFolder(fullName, folder);

      const profileTwo = await ProfileTwo.create({ sex: req.body.sex });
      const result = await AuthLogin.findByIdAndUpdate(user._id, { profile_id_two: profileTwo._id, folder_id }, { new: true }).select("-password");

      return res.status(201).json(result);
    } catch (error) {
      if (error.code === 11000) return res.status(400).json({ error: "Please try another username." }) // Duplicate key error
      else return res.status(400).json({ error: error.message })
    }
  },

  // Create new Applicant/Student
  massCreateStudents: async (req, res) => {
    try {
      const studentsData = req.body; // Expecting an array of student objects
      const ids = studentsData.map(item => item._id)

      // Validate that studentsData is an array
      if (!Array.isArray(studentsData)) {
        return res.status(400).json({ message: 'Input must be an array of student objects' });
      }

      // Check if the array is empty
      if (studentsData.length === 0) {
        return res.status(400).json({ message: 'No applicants provided' });
      }

      // Get the current count to start sequencing
      const currentCount = (await AuthLogin.countDocuments()) + 1;

      // Prepare bulk operations
      const bulkOps = [];
      const idsBulkOps = [];

      // Process students and collect password hashing promises
      const studentPromises = studentsData.map(async (student, index) => {
        const year = new Date().getFullYear();
        const count = currentCount + index;
        const paddedCount = count.toString().padStart(6, '0');
        const student_id = `${year}${paddedCount}`;
        const username = student_id;

        // Hash password
        const password = await BCrypt.hash(process.env.DEFAULT_PASS, 10); // Added salt rounds (10 is a common default)

        const { _id, ...rest } = student;

        return {
          newStudent: { ...rest, student_id, username, password },
          updateOp: _id ? {
            updateOne: {
              filter: { _id: _id },
              update: { $set: { status: "Application Completed" } },
            }
          } : null
        };
      });

      // Wait for all passwords to be hashed
      const processedStudents = await Promise.all(studentPromises);

      // Populate bulk operations
      processedStudents.forEach(({ newStudent, updateOp }) => {
        bulkOps.push({ insertOne: { document: newStudent } });
        if (updateOp) {
          idsBulkOps.push(updateOp);
        }
      });

      // Execute bulk write
      const result = await AuthLogin.bulkWrite(bulkOps);

      // Update status from Submitted to Application Completed
      let appResult = null;
      if (idsBulkOps.length > 0) {
        appResult = await AuthLogin.bulkWrite(idsBulkOps);
      }

      await NotificationController.sendBulkNotification({
        title: "Application Completed",
        log: "Your application has been completed. Congratulations and Welcome to Cavite State University - Bacoor Campus. For more updates, please check your personal email. Thank you.",
      }, ids);

      res.status(201).json({
        message: 'Students created successfully',
        data: ids,
        count: studentsData.length,
        bulkWriteResult: result,
      });

    } catch (error) {
      console.error('Error in massCreateStudents:', error);

      if (error.name === 'ValidationError') {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }

      if (error.name === 'BulkWriteError') {
        error.writeErrors.forEach(writeError => {
          console.error('Document index:', writeError.index);
          console.error('Error message:', writeError.errmsg);
        });
        return res.status(400).json({ message: 'Bulk write error', details: error.writeErrors });
      }

      if (error.name === 'MongoError' && error.code === 11000) {
        return res.status(400).json({ message: 'Duplicate key error: A student with this student_id already exists' });
      }

      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  },

};

module.exports = UserController;