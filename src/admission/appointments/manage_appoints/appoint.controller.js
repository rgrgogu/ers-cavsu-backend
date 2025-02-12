const mongoose = require("mongoose");

const Model = require("./appoint.model");
const {
    CreateBrgyFolder,
    CreateFolder,
    UploadFiles,
    DeleteFiles,
} = require("../../../../global/utils/Drive");

const IsHolidayDuplicate = require("../../../../global/functions/IsHolidayDuplicate")

const GetHolidayGroup = async (req, res) => {
    try {
        const archive = req.query.archive;

        const result = await Model.find({isArchived: archive})
            .populate({
                path: 'created_by',
                select: 'name',
            })
            .populate({
                path: 'updated_by',
                select: 'name',
            })
            .sort({ updatedAt: -1 })

        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const GetHoliday = async (req, res) => {
    try {
        const name = req.params.name

        const result = await Model.findOne({year: name})
            .populate({
                path: 'created_by',
                select: 'name',
            })
            .populate({
                path: 'updated_by',
                select: 'name',
            })

        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

module.exports = {
    GetHolidayGroup,
    GetHoliday,
    EditMultipleHolidays,
};
