const mongoose = require("mongoose");

const Model = require("./holiday.model");
const {
    CreateBrgyFolder,
    CreateFolder,
    UploadFiles,
    DeleteFiles,
} = require("../../../../global/utils/Drive");

const IsHolidayDuplicate = require("../../../../global/functions/IsHolidayDuplicate")

const CreateHolidayGroup = async (req, res) => {
    try {
        const { id } = req.query;
        const data = req.body;

        const result = await Model.create({ ...data, created_by: id })

        res.status(201).json({ message: 'Data created', result });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const EditMultipleHolidays = async (req, res) => {
    try {
        let output = null;
        const doc_id = req.params.id;
        const { id } = req.query;
        const holidays = JSON.parse(req.body?.holidays)
        const addedHolidays = JSON.parse(req.body?.addedHolidays)
        const deletedList = JSON.parse(req.body?.deleted)

        const existingHolidays = [...new Map(holidays.map(item => [JSON.stringify(item), item])).values()]
        const newHolidays = [];
        const duplicateHolidays = [];

        if (addedHolidays.length > 0) {
            addedHolidays.forEach((item) => {
                if (IsHolidayDuplicate(existingHolidays, item)) {
                    duplicateHolidays.push(item); // Already exists, mark as duplicate
                } else {
                    newHolidays.push(item); // Unique, add to new list
                }
            });
        }

        const result = await Model.findByIdAndUpdate(
            { _id: doc_id },
            {
                $push: { holidays: [...newHolidays] },
                $set: { updated_by: id }
            },
            { new: true, upsert: true } // Return updated document
        )

        if (deletedList.length !== 0) {
            const del_arr = deletedList.map((item) => item.name)

            output = await Model.findByIdAndUpdate(
                { _id: doc_id }, // Find the group by its ID
                { $pull: { holidays: { name: { $in: del_arr } } } },
                { new: true }
            )
        }

        res.status(200).json({
            message: newHolidays.length > 0 ? "Holidays added successfully" : "No new holidays added",
            result: deletedList.length > 0 ? output : result,
            new: newHolidays.length > 0 ? newHolidays : "No created holidays",
            duplicates: duplicateHolidays.length > 0 ? duplicateHolidays : "No duplicates",
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

module.exports = {
    CreateHolidayGroup,
    EditMultipleHolidays,
};
