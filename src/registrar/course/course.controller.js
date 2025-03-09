const Course = require('./course.model');

exports.createCourse = async (req, res) => {
  try {
    const { code,
            name,
            lectureUnits,
            labUnits,
            prerequisite,
            semester, } = req.body;

    const existingCourse = await Course.findOne({ code });

    if (existingCourse) {
      return res.status(400).json({ message: 'Course with this code already exists', });
    }

    if (prerequisite !== 'None') {
      const prereqCourse = await Course.findOne({ code: prerequisite });
      if (!prereqCourse) {
        return res.status(400).json({ message: `Prerequisite course ${prerequisite} does not exist`, });
      }
    }

    const course = new Course({
      code,
      name,
      lectureUnits,
      labUnits,
      prerequisite,
      semester,
    });

    await course.save();
    res.status(201).json({ message: 'Course created successfully', course, });
  } catch (error) {
    res.status(400).json({ message: 'Error creating course', error: error.message, });
  }
};

exports.archiveCourse = async (req, res) => {
  try {
    const { code, } = req.params;
    const course = await Course.findOne({ code });

    if (!course) {
      return res.status(404).json({ message: 'Course not found', });
    }

    course.isArchived = true;
    await course.save();
    res.status(200).json({ message: 'Course archived successfully', course, });
  } catch (error) {
    res.status(400).json({ message: 'Error archiving course', error: error.message, });
  }
};

exports.editCourse = async (req, res) => {
  try {
    const { code, } = req.params;
    const { name,
            lectureUnits,
            labUnits,
            prerequisite,
            semester, } = req.body;

    const course = await Course.findOne({ code });
    if (!course) {
      return res.status(404).json({ message: 'Course not found', });
    }

    if (prerequisite && prerequisite !== 'None') {
      const prereqCourse = await Course.findOne({ code: prerequisite });
      if (!prereqCourse) {
        return res.status(400).json({ message: `Prerequisite course ${prerequisite} does not exist`, });
      }
    }

    course.name = name || course.name;
    course.lectureUnits = lectureUnits || course.lectureUnits;
    course.labUnits = labUnits || course.labUnits;
    course.prerequisite = prerequisite || course.prerequisite;
    course.semester = semester || course.semester;

    await course.save();
    res.status(200).json({ message: 'Course updated successfully', course, });
  } catch (error) {
    res.status(400).json({ message: 'Error updating course', error: error.message, });
  }
};

exports.getCourse = async (req, res) => {
  try {
    const { code, } = req.params;
    const course = await Course.findOne({ code });

    if (!course) {
      return res.status(404).json({ message: 'Course not found', });
    }

    let prerequisiteDetails = null;
    if (course.prerequisite !== 'None') {
      prerequisiteDetails = await Course.findOne({ code: course.prerequisite });
    }

    res.status(200).json({
      course,
      prerequisite: course.prerequisite === 'None' ? 'None' : prerequisiteDetails,
    });
  } catch (error) {
    res.status(400).json({ message: 'Error retrieving course', error: error.message, });
  }
};

exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isArchived: false });
    res.status(200).json(courses);
  } catch (error) {
    res.status(400).json({ message: 'Error retrieving courses', error: error.message, });
  }
};