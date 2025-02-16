// const IsHolidayDuplicate = (existingHolidays, item) => {
//     // Create a stringified version of the holiday for comparison
//     const holidayString = JSON.stringify({ ...item, date: new Date(item.date) });
//     for (let existingHoliday of existingHolidays) {
//         if (holidayString === JSON.stringify(existingHoliday)) {
//             return true;  // Found a match, it is a duplicate
//         }
//     }
//     return false;  // No match, it's unique
// }

const IsHolidayDuplicate = (existingHolidays, item) => {
    // Extract the date part only (YYYY-MM-DD) to ignore time differences
    const itemDate = new Date(item.date).toISOString().split("T")[0];

    for (let existingHoliday of existingHolidays) {
        const existingDate = new Date(existingHoliday.date).toISOString().split("T")[0];

        if (itemDate === existingDate) {
            return true; // Found a duplicate date
        }
    }
    return false; // No match found
};

module.exports = IsHolidayDuplicate;