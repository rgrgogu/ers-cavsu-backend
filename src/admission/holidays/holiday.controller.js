const Model = require("./holiday.model");
const IsHolidayDuplicate = require("../../../global/functions/IsHolidayDuplicate")

const GetHolidayGroup = async (req, res) => {
    try {
        const archive = req.query.archive;

        const result = await Model.find({ isArchived: archive })
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

        const result = await Model.findOne({ year: name })
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

const CreateHolidayGroup = async (req, res) => {
    try {
        const { id } = req.query;
        const data = req.body;

        // Check if a document with the same 'year' already exists
        const existingGroup = await Model.findOne({ year: data.year });

        if (existingGroup) {
            return res.status(400).json({ error: `A holiday group for the year ${data.year} already exists.` });
        }

        // Create new document if no duplicate is found
        const result = await Model.create({ ...data, created_by: id });

        res.status(201).json({ message: 'Data created', result });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const CreateSingleHoliday = async (req, res) => {
    try {
        const doc_id = req.params.id;
        const newHoliday = req.body;

        const result = await Model.findOneAndUpdate(
            { $and: [{ _id: doc_id }, { "holidays.date": { $ne: newHoliday.date } }] }, // Ensure date is unique
            { $push: { holidays: newHoliday } }, // Add new holiday if no match
            { new: true, upsert: true } // Return updated doc, create if none exists
        );

        res.status(201).json({ message: 'Data created', result });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const EditHoliday = async (req, res) => {
    try {
        const holiday_id = req.params.id;
        const data = req.body;

        const result = await Model.findOneAndUpdate(
            { "holidays._id": holiday_id },
            {
                "holidays.$.name": data.name,
                "holidays.$.type": data.type,
                "holidays.$.date": data.date,
            },
            { new: true } // Return the updated document
        );

        res.status(200).json(result)
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const EditMultipleHolidays = async (req, res) => {
    try {
        let output = null;
        const doc_id = req.params.id;
        const { id } = req.query;

        const existingHolidays = JSON.parse(req.body?.holidays)
        const addedHolidays = JSON.parse(req.body?.addedHolidays)
        const deletedList = JSON.parse(req.body?.deleted)

        //const existingHolidays = [...new Map(holidays.map(item => [JSON.stringify(item), item])).values()]
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
            const del_arr = deletedList.map((item) => item._id)

            output = await Model.findByIdAndUpdate(
                { _id: doc_id }, // Find the group by its ID
                { $pull: { holidays: { _id: { $in: del_arr } } } },
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

const ArchiveHolidayGroup = async (req, res) => {
    try {
        const id = req.params.id;
        const archive = req.query.archive

        const result = await Model.findByIdAndUpdate(
            { _id: id }, // The ID of the document you want to update
            {
                $set: {
                    isArchived: archive, // Update the created_by field if needed
                },
            },
            { new: true } // Return the updated document
        );

        res.status(200).json({ message: 'Archived successfully', result });
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

module.exports = {
    GetHolidayGroup,
    GetHoliday,
    CreateSingleHoliday,
    CreateHolidayGroup,
    EditMultipleHolidays,
    EditHoliday,
    ArchiveHolidayGroup
};
