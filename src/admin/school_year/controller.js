const SchoolYear = require('./model');
const Section = require('../../registrar/section/model');

// Create a new school year
exports.createSchoolYear = async (req, res) => {
    try {
        const { year, semester, enrollment, faculty_eval, student_eval, grade_upload, status, updated_by } = req.body;

        // Validate semester if any setting is true
        if (enrollment || faculty_eval || student_eval || grade_upload) {
            if (!semester || !['first', 'second', 'third', 'midyear'].includes(semester)) {
                return res.status(400).json({
                    success: false,
                    message: 'A valid semester ("first", "second", "third", or "midyear") is required when any setting is enabled',
                });
            }

            // Check if another school year has the same semester with any setting enabled
            const existingSchoolYear = await SchoolYear.findOne({
                semester,
                isArchived: false,
                $or: [
                    { enrollment: true },
                    { faculty_eval: true },
                    { student_eval: true },
                    { grade_upload: true },
                ],
            });

            if (existingSchoolYear) {
                return res.status(400).json({
                    success: false,
                    message: `Another school year already has settings enabled for the ${semester} semester`,
                });
            }
        }

        // If the new school year has status: true, set all other school years' status to false
        if (status === true) {
            await SchoolYear.updateMany(
                { status: true },
                { $set: { status: false } }
            );
        }

        // Create new school year
        const newSchoolYear = new SchoolYear({
            year,
            semester,
            enrollment,
            faculty_eval,
            student_eval,
            grade_upload,
            status,
            updated_by,
            isArchived: false, // Default value as per schema
        });

        // Save to database
        const savedSchoolYear = await newSchoolYear.save();

        res.status(201).json(savedSchoolYear);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error creating school year',
            error: error.message,
        });
    }
};

// Update a school year
exports.updateSchoolYear = async (req, res) => {
    try {
        const { id } = req.params; // Get the school year ID from the URL
        const { semester, enrollment, faculty_eval, student_eval, grade_upload, status, makeEmptyEnrolledCountsInSection } = req.body;

        // Validate semester if any setting is true
        if (enrollment || faculty_eval || student_eval || grade_upload) {
            if (!semester || !['first', 'second', 'third', 'midyear'].includes(semester)) {
                return res.status(400).json({
                    success: false,
                    message: 'A valid semester ("first", "second", "third", or "midyear") is required when any setting is enabled',
                });
            }

            // // Check if another school year has the same semester with any setting enabled
            // const existingSchoolYear = await SchoolYear.findOne({
            //     _id: { $ne: id }, // Exclude the current school year
            //     semester,
            //     isArchived: false,
            //     $or: [
            //         { enrollment: true },
            //         { faculty_eval: true },
            //         { student_eval: true },
            //         { grade_upload: true },
            //     ],
            // });

            // if (existingSchoolYear) {
            //     return res.status(400).json({
            //         success: false,
            //         message: `Another school year already has settings enabled for the ${semester} semester`,
            //     });
            // }
        }

        // If the updated school year has status: true, set all other school years' status to false
        if (status === true) {
            await SchoolYear.updateMany(
                { status: true, _id: { $ne: id } }, // Exclude the current school year
                { $set: { status: false } }
            );
        }

        // if makeEmptyEnrolledCountsInSection is false, set all sections' enrolledCount to 0
        if (makeEmptyEnrolledCountsInSection === false) {
            await Section.updateMany(
                {}, // Match all documents
                { $set: { enrolled_count: 0 } } // Set enrolled_count to 0
            );
        }

        const updatedSchoolYear = await SchoolYear.findByIdAndUpdate(
            id,
            { $set: { ...req.body } },
            { new: true }
        );

        if (!updatedSchoolYear) {
            return res.status(404).json({
                success: false,
                message: 'School year not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'School year updated successfully',
            data: updatedSchoolYear,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating school year',
            error: error.message,
        });
    }
};

// Get all school years
exports.getAllSchoolYears = async (req, res) => {
    try {
        const { archive } = req.query;
        const schoolYears = await SchoolYear.find({ isArchived: archive }).populate('updated_by', 'name');
        res.json(schoolYears);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single school year by ID
exports.getSchoolYearById = async (req, res) => {
    try {
        const schoolYear = await SchoolYear.findById(req.params.id).populate('updated_by');
        if (!schoolYear) {
            return res.status(404).json({ message: 'School year not found' });
        }
        res.json(schoolYear);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Archive many school years
exports.archiveManySchoolYears = async (req, res) => {
    try {
        const { ids, user_id } = req.body; // Expecting an array of school year IDs

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: 'Please provide an array of school year IDs' });
        }

        const result = await SchoolYear.updateMany(
            { _id: { $in: ids } },
            { isArchived: true, updated_by: user_id },
            { runValidators: true }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'No school years found to archive' });
        }

        res.json({
            message: 'School years archived successfully',
            archivedCount: result.modifiedCount,
            matchedCount: result.matchedCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};