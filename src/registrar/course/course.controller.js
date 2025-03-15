const Course = require('./course.model');
const CourseGroup = require("../course_group/model")

const courseController = {
  // Create a new course
  createCourse: async (req, res) => {
    try {
      const data = req.body;
      const newCourse = new Course({ ...data });
      const savedCourse = await newCourse.save();

      await CourseGroup.findByIdAndUpdate(
        { _id: data.group_id },
        { $push: { courses: savedCourse._id } },
        { new: true }
      );

      res.status(201).json(savedCourse);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  createCoursesMass: async (req, res) => {
    const results = { successful: [], failed: [] };
    const { group_id, courses } = req.body;

    try {
      const insertResult = await Course.insertMany(courses, { ordered: false });
      results.successful = insertResult.map(doc => ({
        index: courses.findIndex(course => course.courseCode === doc.courseCode), // Match by courseCode
        courseCode: doc.courseCode,
        courseTitle: doc.courseTitle,
        lectureCredits: doc.lectureCredits,
        labCredits: doc.labCredits,
        lectureContact: doc.lectureContact,
        labContact: doc.labContact,
        isMajor: doc.isMajor,
        updatedAt: doc.updatedAt,
        updated_by: doc.updated_by,
      }));

      await CourseGroup.findByIdAndUpdate(
        { _id: group_id },
        { $push: { courses: insertResult.map(item => item._id) } },
        { new: true }
      );
    } catch (error) {
      if (error.writeErrors) {
        // Handle individual write errors (e.g., duplicates)
        const writeErrors = error.writeErrors;

        // Map failed courses with their error details
        results.failed = writeErrors.map(err => ({
          index: err.index,
          ...courses[err.index],
          error: 'Duplicate entry (E11000)',
        }));

        // Get successful courses from the error's insertedDocs
        const successfulCourses = error.result?.insertedDocs || error.insertedDocs || [];

        if (successfulCourses.length > 0) {
          // Map successful results with their generated _id
          results.successful = successfulCourses.map((doc) => {
            const originalIndex = courses.findIndex(course => course.courseCode === doc.courseCode);
            return {
              index: originalIndex,
              ...doc
            };
          });

          // Update CourseGroup with the _id array of successful courses
          await CourseGroup.findByIdAndUpdate(
            { _id: group_id },
            { $push: { courses: { $each: successfulCourses.map(item => item._id) } } },
            { new: true }
          );
        } else {
          console.log('No successful courses inserted during the operation');
        }
      } else {
        // Handle other unexpected errors
        results.failed = courses.map((course, index) => ({ ...course, index, error: error.message }));
        return res.status(500).json(results);
      }
    }

    res.status(200).json(results);
  },

  // Read all active courses
  getAllCourses: async (req, res) => {
    try {
      const { archived, group_id } = req.query

      const courseGroups = await CourseGroup.find({
        $and: [{ _id: group_id }]
      })
        .populate('courses')
        .select('courses -_id');

      // Flatten the courses array
      const courses = courseGroups
        .flatMap(group => group.courses)
        .filter(course => course.isArchived === (archived === "false" ? false : true));

      res.status(200).json(courses);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Update course
  updateCourse: async (req, res) => {
    try {
      const { courseCode, courseTitle, lectureCredits, labCredits, lectureContact, labContact, isMajor, courseType, program } = req.body;
      const course = await Course.findById(req.params.id);

      if (!course || course.isArchived) {
        return res.status(404).json({ message: 'Course not found' });
      }

      course.courseCode = courseCode || course.courseCode;
      course.courseTitle = courseTitle || course.courseTitle;
      course.lectureCredits = lectureCredits || course.lectureCredits;
      course.labCredits = labCredits || course.labCredits;
      course.lectureContact = lectureContact || course.lectureContact;
      course.labContact = labContact || course.labContact;
      course.isMajor = isMajor;
      course.courseType = courseType || course.courseType;
      course.program = program || course.program;

      const updatedCourse = await course.save();
      res.status(200).json(updatedCourse);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Archive course
  archiveCourse: async (req, res) => {
    try {
      const { ids, archived, updated_by } = req.body;

      // Validate input
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: 'Please provide an array of course group IDs' });
      }
      if (typeof archived !== 'boolean') {
        return res.status(400).json({ message: 'Archived status must be a boolean' });
      }
      if (!updated_by) {
        return res.status(400).json({ message: 'Updated_by field is required' });
      }

      // Update multiple course groups
      const result = await Course.updateMany(
        { _id: { $in: ids } },
        {
          $set: {
            isArchived: archived,
            updated_by: updated_by,
          }
        },
        { new: true }
      );

      // Check if any documents were modified
      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'No course groups found with provided IDs' });
      }

      res.status(200).json({ message: `${result.modifiedCount} course group(s) archived successfully` });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
};

module.exports = courseController;