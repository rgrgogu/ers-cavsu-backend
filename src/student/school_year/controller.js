// controllers/schoolYearsController.js
const SchoolYear = require('../../admin/school_year/model');

exports.getAllSchoolYears = async (req, res) => {
    try {
        const document = await SchoolYear.find();

        if (!document) {
            return res.status(404).json({ message: 'No active document found' });
        }

        return res.status(200).json(document);
    } catch (error) {
        return res.status(400).json({ message: error });
    }
};

exports.getActiveDocument = async (req, res) => {
    try {
        const document = await SchoolYear.findOne({ isArchived: false, status: true });

        if (!document) {
            return res.status(404).json({ message: 'No active document found' });
        }

        return res.status(200).json(document);
    } catch (error) {
        return res.status(400).json({ message: error });
    }
};