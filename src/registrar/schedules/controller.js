const Schedule = require("./model")

const ScheduleController = {
    CreateSchedule: async (school_year, semester, day_time, session) => {
        try {
            // Validate required fields
            if (!school_year || !semester || !day_time || !Array.isArray(day_time)) {
                throw new Error('Missing required fields');
            }

            // Create a new schedule
            const newSchedule = new Schedule({
                school_year,
                semester,
                day_time,
            });

            const savedSchedule = await newSchedule.save({ session }); // <-- Use the session here
            return savedSchedule._id;
        } catch (error) {
            console.error('Error saving schedule:', error);
            throw new Error(error.message);
        }
    }
}

module.exports = ScheduleController