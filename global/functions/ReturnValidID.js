const { CreateFolder, UploadFiles } = require("../utils/Drive");

const ReturnValidID = async (user_id, verification, files, root_folder, selfie) => {
    const folder_id = await CreateFolder(user_id, root_folder);
    let upload = [];
    
    for (let i = 0; i < files.length; i++) {
        const { id, name } = await UploadFiles(files[i], folder_id)

        upload.push({
            id_type: verification[i].id_type,
            id_number: verification[i].id_number,
            file: {
                link: `https://drive.google.com/thumbnail?id=${id}&sz=w1000`,
                id,
                name,
            }
        });
    }

    const { id: selfieID, name: selfieName } = await UploadFiles(selfie, folder_id)

    return {
        user_folder_id: folder_id,
        valid_id: upload,
        selfie: {
            link: `https://drive.google.com/thumbnail?id=${selfieID}&sz=w1000`,
            id: selfieID,
            name: selfieName,
        },
    }
}

module.exports = ReturnValidID;