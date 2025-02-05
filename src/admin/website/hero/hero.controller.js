const mongoose = require("mongoose");

const Model = require("./hero.model");
const {
    CreateBrgyFolder,
    CreateFolder,
    UploadFiles,
    DeleteFiles,
} = require("../../../../global/utils/Drive");

const GetAll = async (req, res) => {
    try {
        const result = await Model.find()
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

const Create = async (req, res) => {
    try {
        let obj = {}

        const id = req.query.id
        const { body, file } = req
        const DOCUMENT_MAX_SIZE = 1024 * 1024;
        const data = JSON.parse(body.obj)

        if(file){
            if (file.size > DOCUMENT_MAX_SIZE) {
                return res.status(400).json({ error: `File ${file.originalname} exceeds ${DOCUMENT_MAX_SIZE / 1024}KB limit.` });
            }

            const { id, name } = await UploadFiles(file, process.env.HERO_GDRIVE_FOLDER);

            obj = {
                link: `https://drive.google.com/thumbnail?id=${id}&sz=w1000`,
                id,
                name
            }
        }

        const result = await Model.create({ ...data, image: obj, created_by: id })

        res.status(201).json({ message: 'Data created', result });
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const Edit = async (req, res) => {
    try {
        let obj = {}

        const doc_id = req.params.id
        const {user_id, deleted_id} = req.query;
        const { body, file } = req
        const DOCUMENT_MAX_SIZE = 1024 * 1024;
        const data = JSON.parse(body.obj)

        if(file){
            if (file.size > DOCUMENT_MAX_SIZE) {
                return res.status(400).json({ error: `File ${file.originalname} exceeds ${DOCUMENT_MAX_SIZE / 1024}KB limit.` });
            }

            const { id, name } = await UploadFiles(file, process.env.HERO_GDRIVE_FOLDER);

            obj = {
                link: `https://drive.google.com/thumbnail?id=${id}&sz=w1000`,
                id,
                name
            }
        }

        if(deleted_id)
            await DeleteFiles(deleted_id);
        
        const result = await Model.findByIdAndUpdate(
            {_id: doc_id}, // The ID of the document you want to update
            {
                $set: {
                    ...data,
                    updated_by: user_id, // Update the created_by field if needed
                },
                // Conditionally update group_files only if files are provided
                ...(file ? { image: obj } : {}),
            },
            { new: true } // Return the updated document
        );

        res.status(200).json({ message: 'Data edited successfully', result });
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

module.exports = {
    GetAll,
    Create,
    Edit,
};
