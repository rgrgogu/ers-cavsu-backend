const { google } = require("googleapis");
const dotenv = require("dotenv");
const fs = require("fs");
const authorize = require("../config/GDrive");

dotenv.config();

// CREATE FOLDER FOR BARANGAY
const CreateBrgyFolder = async (brgy) => {
    try {
        const { data } = await google
            .drive({ version: "v3", auth: authorize })
            .files.create({
                fields: "id",
                resource: {
                    name: brgy,
                    mimeType: "application/vnd.google-apps.folder",
                    parents: [process.env.ROOT_FOLDER_ID],
                },
            });

        return data.id;
    } catch (err) {
        console.log(err);
    }
};

// CREATE SEVERAL FOLDERS UNDER SPECIFIC BARANGAY FOLDER
const CreateFolder = async (name, folder_id) => {
    try {
        const { data } = await google
            .drive({ version: "v3", auth: authorize })
            .files.create({
                fields: "id",
                resource: {
                    name: name,
                    mimeType: "application/vnd.google-apps.folder",
                    parents: [folder_id],
                },
            });

        return data.id;
    } catch (err) {
        console.log(err);
    }
};

// UPLOAD FILES AND IMAGES IN FOLDER
const UploadFiles = async (fileObject, folder_id) => {
    try {
        const { data } = await google
            .drive({ version: "v3", auth: authorize })
            .files.create({
                media: {
                    mimeType: fileObject.mimeType,
                    body: fs.createReadStream(fileObject.path),
                },
                requestBody: {
                    name: fileObject.originalname,
                    parents: [folder_id],
                },
                fields: "id,name",
            });

        return data;
    } catch (err) {
        console.log(err);
    }
};

// DELETE FOLDER FILES
const DeleteFiles = async (fileID) => {
    try {
        const { data } = await google
            .drive({ version: "v3", auth: authorize })
            .files.delete({fileId: fileID});

        return data;
    } catch (err) {
        console.log(err);
    }
};

module.exports = {
    CreateBrgyFolder,
    CreateFolder,
    UploadFiles,
    DeleteFiles,
};