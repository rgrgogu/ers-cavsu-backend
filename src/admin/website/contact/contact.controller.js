const mongoose = require("mongoose");

const Model = require("./contact.model");

const GetAllContact = async (req, res) => {
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

const CreateContact = async (req, res) => {
    try {
        const id = req.query.id
        const data = req.body;

        const result = await Model.create({ ...data, created_by: id });

        res.status(201).json({ message: 'Data created', result });
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const EditContact = async (req, res) => {
    try {
        const doc_id = req.params.id;
        const user_id = req.query.user_id;
        const data = req.body;

        const result = await Model.findByIdAndUpdate(
            {_id: doc_id}, // The ID of the document you want to update
            {
                ...data,
                updated_by: user_id, // Update the created_by field if needed
            },
            { new: true } // Return the updated document
        );

        res.status(200).json({ message: 'Data edited successfully', result });
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const ArchiveContact = async (req, res) => {
    try {
        const id = req.params.id;
        const archive = req.query.archive
        
        const result = await Model.findByIdAndUpdate(
            {_id: id}, // The ID of the document you want to update
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
    GetAllContact,
    CreateContact,
    EditContact,
    ArchiveContact
};
