const GetAccountType = (type) => {
    const type_dict = { resident: "Resident", staff: "Barangay Staff", brgy_admin: "Barangay Admin", municipality_admin: "Head Admin",}

    return type_dict[type];
};

module.exports = GetAccountType;