const GenerateID = (countBrgy, type, increment) => {
    const type_dict = { resident: 1, staff: 2, brgy_admin: 3, municipality_admin: 4, events: 5, applications: 6, services: 7, requests: 8, patawag: 9, inquiries: 10 }
    const zeroPad = (num, places) => String(num).padStart(places, '0')

    if (type_dict[type] >= 1 && type_dict[type] <= 4)
        return `${zeroPad(countBrgy, 3)}-${zeroPad(increment, 6)}-${type_dict[type]}`
    else
        return `${zeroPad(countBrgy, 3)}${increment}${type_dict[type]}`
};

module.exports = GenerateID;