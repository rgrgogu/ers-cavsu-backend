const Course = require('./course.model');

const courseController = {
  // Create a new course
  createCourse: async (req, res) => {
    try {
     const data = req.body;

      // Validation: Ensure program is provided for Specialized, Elective, and Practicum/OJT
      if (['Specialized', 'Elective', 'Practicum/OJT'].includes(data.courseType) && !data.program) {
        return res.status(400).json({ message: 'Program is required for this course type' });
      }
      
      // Validation: Ensure program is not provided for GE, NSTP, PE
      if (['General Education', 'NSTP', 'Physical Education'].includes(data.courseType) && data.program) {
        return res.status(400).json({ message: 'Program should not be specified for this course type' });
      }

      const newCourse = new Course({...data});
      const savedCourse = await newCourse.save();

      res.status(201).json(savedCourse);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Read all active courses
  getAllCourses: async (req, res) => {
    try {
      const { archived } = req.query
      const courses = await Course.find({ isArchived: archived || false })
        .populate('updated_by', 'name');

      res.status(200).json(courses);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Update course
  updateCourse: async (req, res) => {
    try {
      const { courseCode, courseTitle, lectureCredits, labCredits, courseType, program } = req.body;
      const course = await Course.findById(req.params.id);

      if (!course || course.isArchived) {
        return res.status(404).json({ message: 'Course not found' });
      }

      // Validation for updates
      if (['Specialized', 'Elective', 'Practicum/OJT'].includes(courseType) && !program) {
        return res.status(400).json({ message: 'Program is required for this course type' });
      }
      if (['General Education', 'NSTP', 'Physical Education'].includes(courseType) && program) {
        return res.status(400).json({ message: 'Program should not be specified for this course type' });
      }

      course.courseCode = courseCode || course.courseCode;
      course.courseTitle = courseTitle || course.courseTitle;
      course.lectureCredits = lectureCredits || course.lectureCredits;
      course.labCredits = labCredits || course.labCredits;
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
      const { archived, updated_by } = req.body;

      const course = await Course.findById(req.params.id);

      course.isArchived = archived;
      course.updated_by = updated_by

      const archivedCourse = await course.save();
      res.status(200).json({ message: 'Course archived successfully', course: archivedCourse });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
};

module.exports = courseController;