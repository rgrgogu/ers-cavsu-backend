const {
    CreateBrgyFolder,
    CreateFolder,
    UploadFiles,
    DeleteFiles,
} = require("../utils/Drive");

const UploadApplicantFiles = async (files, folder_id, doc_type) => {
    const DOCUMENT_MAX_SIZE = 1024 * 1024;

    let documents = [];
    let err = [];

    for (const file of files) {
        if (file.size > DOCUMENT_MAX_SIZE) {
            err.push({ error: `File ${file.originalname} exceeds ${DOCUMENT_MAX_SIZE / 1024}KB limit.` })
        }
    }

    if (err.length === 0)
        for (let f = 0; f < files.length; f += 1) {
            const file = files[f]
            const { id, name } = await UploadFiles(file, folder_id);

            if (file.mimetype.startsWith('image/')) {
                documents.push({
                    link: `https://drive.google.com/thumbnail?id=${id}&sz=w1000`,
                    id,
                    name,
                    type: doc_type[f]
                })
            } else if (file.mimetype.startsWith('application/')) {
                documents.push({
                    link: `https://drive.google.com/file/d/${id}`,
                    id,
                    name,
                    type: doc_type[f]
                })
            } else {
                err.push({ error: `Unknown file type for ${file.originalname}` })
            }
        }

    return { err, documents };
}

module.exports = UploadApplicantFiles