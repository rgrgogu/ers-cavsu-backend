const mongoose = require('mongoose');
const dotenv = require("dotenv");
const cors = require("cors");
const { Server } = require("socket.io");
const cookieparser = require('cookie-parser');

const express = require("express");
const ConnectDB = require("./global/config/DB");
const { SocketIO } = require("./global/config/SocketIO")

// IMPORT ROUTES
const Route = require("./import")

dotenv.config();
ConnectDB();
const app = express();
const server = SocketIO(app)

const allowedOrigins = [
    "http://localhost:5173",
    "https://cvsu-ers.netlify.app",
    "https://ers-cavsu-frontend.vercel.app",
    "https://drive.google.com",
    "https://ominous-space-spoon-jvvj6rg54pw2q5jr-8080.app.github.dev"
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, origin); // Allow the request
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true, // Allow cookies and authentication headers
    methods: "GET, POST, PUT, DELETE, OPTIONS",
    allowedHeaders: "Content-Type, Authorization",
    optionSuccessStatus: 200,
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieparser());
app.use(cors(corsOptions));
app.use((req, res, next) => {
    const origin = req.headers.origin;

    if (allowedOrigins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
    }
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,PATCH");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization"
    );
    console.log(req.path, req.method);
    next();
});

// Routes
Route(app);

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to ERS CAVSU System's API",
    });
});

mongoose.connection.once("open", () => {
    console.log("Database connected.");

    // app.listen(process.env.PORT, () => console.log(`Server started on port ${process.env.PORT}`))
    // server.listen(process.env.PORT, () =>
    //     console.log(`Server started on port ${process.env.PORT}`)
    // );
    server.listen(process.env.PORT || 4000, "0.0.0.0", () =>
        console.log(`Server started on port ${process.env.PORT || 4000}`)
    );

});