const Program = require('../../registrar/programs/model');

exports.getProgramsByApplicantType = async (req, res) => {
    try {
        const programs = await Program.find({ isArchived: false }).select('name applicant_types').lean();

        const typeMap = {
            ALS: "Alternative Learning System (ALS) Passer",
            //Foreign: "Foreign Undergraduate Student Applicant",
            Arts: "Arts and Design",
            Sports: "Sports",
            General: "General",
            "Tech-Voc-Agricultural": ["Tech-Voc", "Agricultural-Fishery Arts"],
            "Tech-Voc-Home": ["Tech-Voc", "Home Economics"],
            "Tech-Voc-Industrial": ["Tech-Voc", "Industrial Arts"],
            "Tech-Voc-ICT": ["Tech-Voc", "Information and Communications Technology"],
            ABM: "Accountancy, Business and Management",
            STEM: "Science, Technology, Engineering, and Mathematics",
            HUMSS: "Humanities and Social Science",
            "General Academic": "General Academic"
        };

        const result = {
            "Alternative Learning System (ALS) Passer": [],
            //"Foreign Undergraduate Student Applicant": [],
            Arts: [],
            Sports: [],
            General: [],
            "Tech-Voc": { "Agricultural-Fishery Arts": [], "Home Economics": [], "Industrial Arts": [], "Information and Communications Technology": [] },
            "Accountancy, Business and Management": [],
            "Science, Technology, Engineering, and Mathematics": [],
            "Humanities and Social Science": [],
            "General Academic": []
        };

        programs.forEach(p => p.applicant_types.forEach(t => {
            const target = typeMap[t];
            if (Array.isArray(target)) result[target[0]][target[1]].push(p.name);
            else result[target].push(p.name);
        }));

        for (let k in result) {
            result[k] = Array.isArray(result[k]) ? [...new Set(result[k])].sort() :
                Object.fromEntries(Object.entries(result[k]).map(([sk, v]) => [sk, [...new Set(v)].sort()]));
        }

        res.status(200).json(result);
    } catch (e) {
        res.status(500).json({ message: "Error", error: e.message });
    }
};