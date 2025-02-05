// APPLICANT
// const account_login = require('./src/applicant/account_login/account_login.route');
// const profile = require('./src/applicant/profile/profile.route');

const routes = [
    { api: "/api/admin/auth", router: require('./src/admin/login/adm_login.route.js') },
    { api: "/api/admin/profile", router: require('./src/admin/profile/adm_profile.route.js') },
    { api: "/api/admin/w_adguide", router: require('./src/admin/website/admission_guide/admission_guide.route.js') },
    { api: "/api/admin/w_info", router: require('./src/admin/website/cavsu_info/cavsu_info.route.js') },
    { api: "/api/admin/w_ers", router: require('./src/admin/website/ers/ers.route.js') },
    { api: "/api/admin/w_events", router: require('./src/admin/website/events/events.route.js') },
]

const Route = (app) => {
    for (const route of routes)
        app.use(route.api, route.router);
}

module.exports = Route;