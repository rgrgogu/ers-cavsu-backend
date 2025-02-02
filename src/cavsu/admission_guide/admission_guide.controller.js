const mongoose = require("mongoose");

const Model = require("./admission_guide.model");
const {
    CreateBrgyFolder,
    CreateFolder,
    UploadFiles,
    DeleteFiles,
} = require("../../../global/utils/Drive");

const GetAllAdmissionGuide = async (req, res) => {
    try {
        const result = await Model.find({})
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

const CreateAdmissionGuide = async (req, res) => {
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

        const folder_id = await CreateFolder(data.group_name, process.env.ADMISSION_GUIDE_GDRIVE_FOLDER);

        for (const file of files) {
            const { id, name } = await UploadFiles(file, folder_id);

            group_files.push({
                link: `https://drive.google.com/thumbnail?id=${file.id}&sz=w1000`,
                id,
                name
            })
        }

        const result = await Model.create({ ...data, group_files, folder_id, created_by: id })

        res.status(201).json({ message: 'Data created', result });
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

module.exports = {
    GetAllAdmissionGuide,
    CreateAdmissionGuide,
};
