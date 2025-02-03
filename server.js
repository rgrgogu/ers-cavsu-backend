const mongoose = require('mongoose');
const dotenv = require("dotenv");
const cors = require("cors");
const cookieparser = require('cookie-parser');
const express = require("express");
const ConnectDB = require("./global/config/DB");
const SocketIO = require("./global/config/SocketIO")

// APPLICANT
const account_login = require('./src/applicant/account_login/account_login.route');
const profile = require('./src/applicant/profile/profile.route');

// ADMIN
const admin_account_login = require('./src/admin/admin_account_login/admin_account_login.route');
const admin_profile = require('./src/admin/admin_account_profile/admin_profile.route');
const website = require('./src/admin/website/admission_guide/admission_guide.route');
const info = require('./src/admin/website/cavsu_info/cavsu_info.route');
const contact = require('./src/admin/website/contact/contact.route');
const ers = require('./src/admin/website/ers/ers.route');
const events = require('./src/admin/website/events/events.route');

dotenv.config();
ConnectDB();
const app = express();
const server = SocketIO(app)

// Middleware
app.use(express.json());
app.use(cookieparser());
app.use(cors({ origin: ["http://localhost:5173"], credentials: true, optionSuccessStatus: 200 }));
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", ["http://localhost:5173"]);
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,PATCH");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization"
    );
    console.log(req.path, req.method);
    next();
});

// Routes
app.use("/api/applicant/auth", account_login);
app.use("/api/applicant/profile", profile);

app.use("/api/admin/auth", admin_account_login);
app.use("/api/admin/profile", admin_profile);
app.use("/api/admin/website", website);
app.use("/api/admin/w_info", info);
app.use("/api/admin/w_contact", contact);
app.use("/api/admin/w_ers", ers);
app.use("/api/admin/w_events", events);

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to ERS CAVSU System's API",
    });
});

mongoose.connection.once("open", () => {
    console.log("Database connected.");

    server.listen(process.env.PORT, () =>
        console.log(`Server started on port ${process.env.PORT}`)
    );
});