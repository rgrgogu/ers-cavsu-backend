const mongoose = require('mongoose');
const Enrollment = require('./model'); // Adjust path to your enrollment model
const EnrollmentDetails = require('../enrollment_details/model')
const Profile = require("../../auth/profile_one/model");
const EnrollmentDetailsController = require('../enrollment_details/controller');
const ChecklistController = require('../checklist/controller');
const Section = require("../section/model")
const Students = require('../../auth/login/model');

const EnrollmentController = {
  // Get all enrollments with optional filters
  GetEnrollmentAll: async (req, res) => {
    try {
      const students = await Students.find({ role: 'student', isArchived: false })
        .populate('profile_id_one', 'application_details student_details')
        .populate({
          path: 'profile_id_one',
          select: 'application_details student_details',
          populate: {
            path: 'student_details.section_id',
            select: 'section_code'
          }
        })


      // // Fetch enrollments with populated references
      // const enrollments = await Enrollment.find({})
      //   .populate({
      //     path: 'student_id',
      //     select: 'name profile_id_one user_id',
      //     populate: {
      //       path: 'profile_id_one',
      //       select: 'application_details student_details'
      //     }
      //   })
      //   .populate('enrolled_courses.details', 'course_id')
      //   .populate('enrolled_courses.enlisted_by', 'name')
      //   .populate('enrolled_courses.enrolled_by', 'name')
      //   .populate('section_id', 'section_code') // Adjust fields as needed
      //   .populate('school_year', 'year') // Adjust fields as needed

      return res.status(200).json({
        success: true,
        data: students,
        message: `Retrieved ${students.length} enrollments`
      });
    } catch (error) {
      console.error('Error in GetEnrollmentAll:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve enrollments',
        error: error.message
      });
    }
  },

  GetAllEnrolledCourses: async (req, res) => {
    try {
      const enrollments = await Enrollment.find({ student_id: req.params.student_id })
        .populate('enrolled_courses.details', 'course_id')
        .populate('enrolled_courses.enlisted_by', 'name')
        .populate('enrolled_courses.enrolled_by', 'name')
        .populate('section_id', 'section_code') // Adjust fields as needed
        .populate('school_year', 'year') // Adjust fields as needed

      res.status(200).json(enrollments)
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve enrollments',
        error: error.message
      });
    }
  },

  // Create multiple enrollment records efficiently using bulkWrite
  MassCreateEnlistment: async (req, res) => {
    try {
      const { enrollment, profile } = req.body;
      const { student_id, curriculum_id, section_id, school_year, semester, year_level, user, courses } = enrollment;

      // Validate student_id and profile arrays
      if (student_id.length !== profile.length) {
        return res.status(400).json({
          success: false,
          message: 'student_id and profile arrays must have equal lengths'
        });
      }

      // Start a transaction for atomicity
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // Step 1: Create Checklist for each student and create enrollment details (enrolled courses) if existing, get the ids.
        const enrolledCoursesIds = await EnrollmentDetailsController.MassCreateEnlistmentDetails(
          courses, school_year, semester, user, section_id, session
        );

        await ChecklistController.MassCreateChecklist(student_id, curriculum_id, session);

        // Step 2: Prepare for Enrollment Data and Profile Update to student details as enrollment id.
        const enrollmentBulkOps = student_id.map((sid) => {
          const enrollmentId = new mongoose.Types.ObjectId();
          return {
            insertOne: {
              document: {
                _id: enrollmentId,
                student_id: sid,
                section_id,
                school_year,
                semester,
                year_level, // Convert to string per schema
                enrolled_courses: enrolledCoursesIds.map(id => ({
                  details: id,
                  enrollment_status: 'Enlisted',
                  enlisted_by: user,
                  updated_by: user,
                  date_enlisted: new Date()
                })),
              }
            }
          };
        });

        // Capture enrollment IDs
        const enrollmentIds = enrollmentBulkOps.map(op => op.insertOne.document._id);

        // Prepare profile update operations
        const profileBulkOps = profile.map((profileId, index) => ({
          updateOne: {
            filter: { _id: profileId },
            update: {
              $set: {
                'student_details.enrollment_id': enrollmentIds[index],
                'student_details.section_id': section_id
              }
            }
          }
        }));

        // Execute bulk writes
        await Enrollment.bulkWrite(enrollmentBulkOps, { session });
        await Profile.bulkWrite(profileBulkOps, { session });
        await Section.findByIdAndUpdate(section_id, { $inc: { enrolled_count: student_id.length } }, { session })

        // Commit transaction
        await session.commitTransaction();

        return res.status(201).json({
          success: true,
          data: {
            insertedEnrollments: enrollmentBulkOps.length,
            updatedProfiles: profileBulkOps.length,
            enrollmentIds
          },
          message: `${enrollmentBulkOps.length} enrollments created and ${profileBulkOps.length} profiles updated`
        });
      } catch (error) {
        // Rollback transaction on error
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    } catch (error) {
      console.error('Error in MassCreateEnlistment:', error);
      const status = error.name === 'ValidationError' || error.code === 11000 ? 400 : 500;
      return res.status(status).json({
        success: false,
        message: 'Failed to create enrollments or update profiles',
        error: error.message
      });
    }
  },

  // Create multiple enrollment records efficiently using bulkWrite
  MassCreateEnlistmentOld: async (req, res) => {
    try {
      const { enrollment, profile } = req.body;
      const {
        student_id,
        section_id,
        school_year,
        semester,
        year_level,
        user,
        courses,
        student_type,
        student_status
      } = enrollment;

      if (!student_id || !profile) {
        return res.status(400).json({
          success: false,
          message: 'Missing student_id or profile data'
        });
      }

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // Step 1: Create Enrollment Details
        const enrolledCoursesIds = await EnrollmentDetailsController.MassCreateEnlistmentDetails(
          courses, school_year, semester, user, section_id, session
        );

        // Step 2: Create Enrollment
        const enrollmentId = new mongoose.Types.ObjectId();
        await Enrollment.create([{
          _id: enrollmentId,
          student_id,
          section_id,
          school_year,
          semester,
          year_level,
          enrolled_courses: enrolledCoursesIds.map(id => ({
            details: id,
            enrollment_status: 'Enlisted',
            enlisted_by: user,
            updated_by: user,
            date_enlisted: new Date()
          }))
        }], { session });

        // Step 3: Update Profile
        await Profile.updateOne(
          { _id: profile },
          {
            $set: {
              'student_details.enrollment_id': enrollmentId,
              'student_details.section_id': section_id,
              'student_details.student_status': student_status,
              'student_details.student_type': student_type
            }
          },
          { session }
        );

        // Step 4: Update Section Count
        await Section.findByIdAndUpdate(
          section_id,
          { $inc: { enrolled_count: 1 } },
          { session }
        );

        await session.commitTransaction();
        session.endSession();

        return res.status(201).json({
          success: true,
          data: {
            enrollmentId,
            message: `Enrollment created and profile updated`
          }
        });

      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
      }

    } catch (error) {
      console.error('Error in MassCreateEnlistmentSingle:', error);
      const status = error.name === 'ValidationError' || error.code === 11000 ? 400 : 500;
      return res.status(status).json({
        success: false,
        message: 'Failed to create enrollment or update profile',
        error: error.message
      });
    }
  },

  UpdateToEnrolledFirstYear: async (req, res) => {
    const { student_ids, enrolled_by } = req.body;

    if (!Array.isArray(student_ids) || !enrolled_by) {
      return res.status(400).json({
        success: false,
        message: 'student_ids (array) and enrolled_by (ID) are required.'
      });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const now = new Date();

      const bulkOps = student_ids.map(id => ({
        updateOne: {
          filter: { student_id: new ObjectId(id) },
          update: {
            $set: {
              enrollment_status: 'Enrolled',
              enrolled_by: new ObjectId(enrolled_by),
              date_enrolled: now
            }
          }
        }
      }));

      const result = await Enrollment.bulkWrite(bulkOps, { session });

      await session.commitTransaction();
      session.endSession();

      return res.status(200).json({
        success: true,
        message: `${result.modifiedCount} enrollments updated to Enrolled.`,
        result
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error('Error in UpdateToEnrolled:', error);

      return res.status(500).json({
        success: false,
        message: 'Failed to update enrollments to Enrolled status.',
        error: error.message
      });
    }
  },

  UpdateToEnrolled: async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { doc_id, enrolledCoursesIds, enrolledDetailsCourseIds, user } = req.body;

      // 1. Update enrollment status and metadata
      const updatedEnrollment = await Enrollment.updateOne(
        { _id: doc_id },
        {
          $set: {
            "enrolled_courses.$[elem].enrollment_status": "Enrolled",
            "enrolled_courses.$[elem].enrolled_by": user,
            "enrolled_courses.$[elem].date_enrolled": new Date()
          }
        },
        {
          arrayFilters: [{ "elem._id": { $in: enrolledCoursesIds } }],
          session
        }
      );

      // 3. Increment enrolled_count for each referenced enrollment_details
      // Fix tommorrow
      // await EnrollmentDetails.updateMany(
      //   { course_id: { $in: enrolledDetailsCourseIds } },
      //   { $inc: { enrolled_count: 1 } },
      //   { session }
      // );

      await session.commitTransaction();
      session.endSession();

      return res.status(200).json({
        success: true,
        message: 'Enrollment status updated and count incremented',
        data: updatedEnrollment
      });

    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error('UpdateToEnrolled Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update enrollment status',
        error: error.message
      });
    }
  },

  // Edit an existing enrollment by ID
  EditEnrollment: async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Validate ID
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid enrollment ID'
        });
      }

      // Validate updates
      const allowedUpdates = [
        'student_id',
        'section_id',
        'school_year',
        'semester',
        'year_level',
        'enrolled_courses',
        'enrollment_status',
        'enlisted_by',
        'date_enlisted',
        'enrolled_by',
        'date_enrolled',
        'updated_by'
      ];
      const updateKeys = Object.keys(updates);
      const isValidUpdate = updateKeys.every(key => allowedUpdates.includes(key));
      if (!isValidUpdate || updateKeys.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or empty update fields'
        });
      }

      // Validate ObjectIds and enums
      if (updates.student_id && !mongoose.Types.ObjectId.isValid(updates.student_id)) {
        return res.status(400).json({ success: false, message: 'Invalid student_id' });
      }
      if (updates.section_id && !mongoose.Types.ObjectId.isValid(updates.section_id)) {
        return res.status(400).json({ success: false, message: 'Invalid section_id' });
      }
      if (updates.school_year && !mongoose.Types.ObjectId.isValid(updates.school_year)) {
        return res.status(400).json({ success: false, message: 'Invalid school_year' });
      }
      if (updates.enrolled_courses && !mongoose.Types.ObjectId.isValid(updates.enrolled_courses)) {
        return res.status(400).json({ success: false, message: 'Invalid enrolled_courses' });
      }
      if (updates.updated_by && !mongoose.Types.ObjectId.isValid(updates.updated_by)) {
        return res.status(400).json({ success: false, message: 'Invalid updated_by' });
      }
      if (updates.semester && !['first', 'second', 'third', 'midyear'].includes(updates.semester)) {
        return res.status(400).json({ success: false, message: 'Invalid semester' });
      }
      if (updates.enrollment_status && !['Enrolled', 'Enlisted'].includes(updates.enrollment_status)) {
        return res.status(400).json({ success: false, message: 'Invalid enrollment_status' });
      }

      // Update enrollment
      const enrollment = await Enrollment.findByIdAndUpdate(
        id,
        { ...updates, updatedAt: Date.now() },
        { new: true, runValidators: true }
      );

      if (!enrollment) {
        return res.status(404).json({
          success: false,
          message: 'Enrollment not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: enrollment,
        message: 'Enrollment updated successfully'
      });
    } catch (error) {
      console.error('Error in EditEnrollment:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update enrollment',
        error: error.message
      });
    }
  },

  // Get an enrollment by ID
  GetEnrollmentById: async (req, res) => {
    try {
      const { id } = req.params;

      // Validate ID
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid enrollment ID'
        });
      }

      // Fetch enrollment with populated references
      const enrollment = await Enrollment.findById(id)
        .populate('student_id', 'name email') // Adjust fields as needed
        .populate('section_id', 'name') // Adjust fields as needed
        .populate('school_year', 'year') // Adjust fields as needed
        .populate('enrolled_courses', 'courses'); // Adjust fields as needed

      if (!enrollment) {
        return res.status(404).json({
          success: false,
          message: 'Enrollment not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: enrollment,
        message: 'Enrollment retrieved successfully'
      });
    } catch (error) {
      console.error('Error in GetEnrollmentById:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve enrollment',
        error: error.message
      });
    }
  },


};

module.exports = EnrollmentController;