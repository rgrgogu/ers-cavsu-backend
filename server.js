const mongoose = require('mongoose');
const dotenv = require("dotenv");
const cors = require("cors");
const cookieparser = require('cookie-parser');
const express = require("express");
const ConnectDB = require("./global/config/DB");
const SocketIO = require("./global/config/SocketIO")

const account_login = require('./src/account_login/account_login.route');

dotenv.config();
ConnectDB();
const app = express();
const server = SocketIO(app)

// Middleware
app.use(express.json());
app.use(cookieparser());
app.use(cors({ origin: "*", credentials: true, optionSuccessStatus: 200 }));
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,PATCH");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization"
    );
    console.log(req.path, req.method);
    next();
});

// Routes
app.use("/api/auth", account_login);

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to Barangay E-Services Management System's API",
    });
});

mongoose.connection.once("open", () => {
    console.log("Database connected.");

    server.listen(process.env.PORT, () =>
        console.log(`Server started on port ${process.env.PORT}`)
    );
});