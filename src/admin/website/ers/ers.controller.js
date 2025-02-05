const mongoose = require("mongoose");

const Model = require("./ers.model");
const {
    CreateBrgyFolder,
    CreateFolder,
    UploadFiles,
    DeleteFiles,
} = require("../../../../global/utils/Drive");

const GetAll = async (req, res) => {
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

const Create = async (req, res) => {
    try {
        const id = req.query.id
        const { body, files } = req
        const DOCUMENT_MAX_SIZE = 1024 * 1024;
        const data = JSON.parse(body.obj)
        let group_files = []

        if (files.length != 0) {
            let err = [];

            for (const file of files) {
                if (file.size > DOCUMENT_MAX_SIZE) {
                    err.push({ error: `File ${file.originalname} exceeds ${DOCUMENT_MAX_SIZE / 1024}KB limit.` })
                    console.log(err)
                }
            }

            if (err.length != 0)
                return res.status(400).json(err);
        }

        const doc_id = new mongoose.Types.ObjectId()
        const folder_id = await CreateFolder(doc_id, process.env.ADMISSION_GUIDE_GDRIVE_FOLDER);

        for (const file of files) {
            const { id, name } = await UploadFiles(file, folder_id);

            group_files.push({
                link: `https://drive.google.com/thumbnail?id=${id}&sz=w1000`,
                id,
                name
            })
        }

        const result = await Model.create({ ...data, _id: doc_id, group_files, folder_id, created_by: id })

        res.status(201).json({ message: 'Data created', result });
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const Edit = async (req, res) => {
    try {
        const id = req.params.id
        const {folder_id, user_id} = req.query;
        const { body, files } = req
        const DOCUMENT_MAX_SIZE = 1024 * 1024;
        const data = JSON.parse(body.obj)
        const deletedList = JSON.parse(body.deleted)

        let group_files = []

        if (files.length != 0) {
            let err = [];

            for (const file of files) {
                if (file.size > DOCUMENT_MAX_SIZE) {
                    err.push({ error: `File ${file.originalname} exceeds ${DOCUMENT_MAX_SIZE / 1024}KB limit.` })
                    console.log(err)
                }
            }

            if (err.length != 0)
                return res.status(400).json(err);

            for (const file of files) {
                const { id, name } = await UploadFiles(file, folder_id);
    
                group_files.push({
                    link: `https://drive.google.com/thumbnail?id=${id}&sz=w1000`,
                    id,
                    name
                })
            }
        }
        
        const result = await Model.findByIdAndUpdate(
            {_id: id}, // The ID of the document you want to update
            {
                $set: {
                    ...data,
                    updated_by: user_id, // Update the created_by field if needed
                },
                // Conditionally update group_files only if files are provided
                ...(files && files.length > 0 ? { $push: { group_files: group_files }  } : {}),
            },
            { new: true } // Return the updated document
        );

        if(deletedList.length !== 0) {
            for (const file of deletedList){
                console.log(file._id)
                await DeleteFiles(file.id);
            }

            const del_arr = deletedList.map((item) => item.id)

            const output = await Model.findByIdAndUpdate(
                { _id: id }, // Find the group by its ID
                { $pull: { group_files: { id: { $in: del_arr } } } },
                { new: true}
            )

            res.status(200).json({ message: 'Data edited successfully', result: output });
        }
        else{
            res.status(200).json({ message: 'Data edited successfully', result });
        }
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

const Archive = async (req, res) => {
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
    GetAll,
    Create,
    Edit,
    Archive
};
