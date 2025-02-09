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

const CreateSingleHoliday = async (req, res) => {
    try {
        const { id, doc_id } = req.query;
        const data = req.body;

        const result = await Model.findByIdAndUpdate(
            { _id: doc_id },
            {
                $push: { holiday: data },
                $set: { updated_by: id }
            },
            { new: true } // Return updated document
        )

        res.status(201).json({ message: 'Data created', result });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}


const EditMultipleHolidays = async (req, res) => {
    try {
        const doc_id = req.params.id;
        const { id } = req.query;
        const holidays = JSON.parse(req.body?.holidays)
        const addedHolidays = JSON.parse(req.body?.addedHolidays)

        //console.log(holidays, addedHolidays, id, doc_id)

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

        res.status(201).json({
            message: newHolidays.length > 0 ? "Holidays added successfully" : "No new holidays added",
            result,
            new: newHolidays.length > 0 ? newHolidays : "No created holidays",
            duplicates: duplicateHolidays.length > 0 ? duplicateHolidays : "No duplicates",
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

module.exports = {
    CreateHolidayGroup,
    CreateSingleHoliday,
    EditMultipleHolidays,
};
