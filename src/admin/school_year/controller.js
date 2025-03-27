// controllers/schoolYearsController.js
const SchoolYear = require('./model');

// Create a new school year
exports.createSchoolYear = async (req, res) => {
    try {
        const { year, enrollment, faculty_eval, grade_upload, status, updated_by } = req.body;

        // Validate that only one semester is true (reinforcing the middleware)
        const enrollment_count = Object.values(enrollment).filter(Boolean).length;
        if (enrollment_count > 1) {
            return res.status(400).json({
                success: false,
                message: 'Only one semester can be open for enrollment at a time',
            });
        }

        const faculty_count = Object.values(faculty_eval).filter(Boolean).length;
        if (faculty_count > 1) {
            return res.status(400).json({
                success: false,
                message: 'Only one semester can be open for enlistment at a time',
            });
        }

        const grade_count = Object.values(grade_upload).filter(Boolean).length;
        if (grade_count > 1) {
            return res.status(400).json({
                success: false,
                message: 'Only one semester can be open for grade upload at a time',
            });
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
            enrollment,
            faculty_eval,
            grade_upload,
            status,
            updated_by,
            isArchived: false, // Default value as per schema
        });

        // Save to database
        const savedSchoolYear = await newSchoolYear.save();

        res.status(201).json({
            success: true,
            message: 'School year created successfully',
            data: savedSchoolYear,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error creating school year',
            error: error.message,
        });
    }
};

exports.updateSchoolYear = async (req, res) => {
    try {
        const { id } = req.params; // Get the school year ID from the URL
        const { enrollment, faculty_eval, grade_upload, status, } = req.body;

        // Validate that only one semester is true (reinforcing the middleware)
        const enrollment_count = Object.values(enrollment).filter(Boolean).length;
        if (enrollment_count > 1) {
            return res.status(400).json({
                success: false,
                message: 'Only one semester can be open for enrollment at a time',
            });
        }

        const faculty_count = Object.values(faculty_eval).filter(Boolean).length;
        if (faculty_count > 1) {
            return res.status(400).json({
                success: false,
                message: 'Only one semester can be open for enlistment at a time',
            });
        }

        const grade_count = Object.values(grade_upload).filter(Boolean).length;
        if (grade_count > 1) {
            return res.status(400).json({
                success: false,
                message: 'Only one semester can be open for grade upload at a time',
            });
        }

        // If the new school year has status: true, set all other school years' status to false
        if (status === true) {
            await SchoolYear.updateMany(
                { status: true },
                { $set: { status: false } }
            );
        }

        const updatedSchoolYear = await SchoolYear.findByIdAndUpdate(
            id,
            { $set: { ...req.body } },
            { new: true }
        )

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
        const { archive } = req.query
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