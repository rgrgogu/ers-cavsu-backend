const Curriculum = require('../../admin/curriculum/model');
const Checklist = require('./model');

const ChecklistController = {
    MassCreateChecklist: async (studentIds, curriculumId, session) => {
        try {
            const curriculum = await Curriculum.findById(curriculumId).lean(); // .lean() for performance

            if (!curriculum) {
                throw new Error('No curricula found');
            }

            // Transform curricula to checklist documents
            const checklistOps = studentIds.map((id) => {
                const checklistDoc = {
                    student_id: id,
                    code: curriculum.code,
                    name: curriculum.name,
                    program: curriculum.program,
                    hasFifthYear: curriculum.hasFifthYear,
                    years: curriculum.years.map(year => ({
                        year: year.year,
                        semesters: {
                            first: year.semesters.first.map(course => ({
                                course_id: course.course_id,
                                pre_req_ids: course.pre_req_ids,
                                pre_req_strings: course.pre_req_strings,
                                grade_id: null,
                                eval_id: null
                            })),
                            second: year.semesters.second.map(course => ({
                                course_id: course.course_id,
                                pre_req_ids: course.pre_req_ids,
                                pre_req_strings: course.pre_req_strings,
                                grade_id: null,
                                eval_id: null
                            })),
                            third: year.semesters.third.map(course => ({
                                course_id: course.course_id,
                                pre_req_ids: course.pre_req_ids,
                                pre_req_strings: course.pre_req_strings,
                                grade_id: null,
                                eval_id: null
                            })),
                            midyear: year.semesters.midyear.map(course => ({
                                course_id: course.course_id,
                                pre_req_ids: course.pre_req_ids,
                                pre_req_strings: course.pre_req_strings,
                                grade_id: null,
                                eval_id: null
                            }))
                        }
                    })),
                    total_units: curriculum.total_units,
                    updated_by: curriculum.updated_by,
                    isArchived: curriculum.isArchived
                };

                return {
                    insertOne: {
                        document: checklistDoc
                    }
                };
            });

            // Perform bulkWrite
            const result = await Checklist.bulkWrite(checklistOps, { session });

            return result;
        } catch (error) {
            console.error('Error in curriculaToChecklists:', error);
            throw error;
        }
    },

    GetChecklistForEnrollee: async (req, res) => {
        try {
            const student_id = req.params.id

            const result = await Checklist.findOne({ student_id })
                .populate({
                    path: 'years.semesters.first.course_id years.semesters.second.course_id years.semesters.third.course_id years.semesters.midyear.course_id',
                    select: 'courseCode courseTitle credits',
                })
                .populate({
                    path: 'years.semesters.first.pre_req_ids years.semesters.second.pre_req_ids years.semesters.third.pre_req_ids years.semesters.midyear.pre_req_ids',
                    select: 'courseCode',
                })
                .populate({
                    path: 'program',
                    select: 'name',
                })
                .lean();

            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: 'Checklist not found',
                });
            }

            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({
                success: false,
                message: 'Error fetching checklist',
                error: error.message,
            });
        }
    },

    GetChecklistForStudent: async (req, res) => {
        try {
            const student_doc_id = req.params.id

            const result = await Checklist.findOne({ student_id: student_doc_id })
                .populate({
                    path: 'years.semesters.first.course_id years.semesters.second.course_id years.semesters.third.course_id years.semesters.midyear.course_id',
                    select: 'courseCode courseTitle credits',
                })
                .populate({
                    path: 'years.semesters.first.pre_req_ids years.semesters.second.pre_req_ids years.semesters.third.pre_req_ids years.semesters.midyear.pre_req_ids',
                    select: 'courseCode',
                })
                .populate({
                    path: 'program',
                    select: 'name',
                })
                .lean();

            if (!result) {
                return res.status(404).json({
                    success: false,
                    message: 'Checklist not found',
                });
            }

            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({
                success: false,
                message: 'Error fetching checklist',
                error: error.message,
            });
        }
    },
}

module.exports = ChecklistController