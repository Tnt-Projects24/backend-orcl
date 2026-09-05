import { config } from "dotenv";
import express from "express";

import {
    connectDB,
    disconnectDB
} from "./config/database.js";

import movieRoutes from "./routes/movieRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import watchListRoutes from "./routes/watchListRoutes.js";

config();


const app = express();

//Body parse 

app.use(express.json());
app.use(express.urlencoded({extended: true}));

// API Routes
app.use("/movies", movieRoutes);
app.use("/auth", authRoutes);
app.use("/watchlist",watchListRoutes);

// Test route
app.get("/hello", (req, res) => {
    res.json({
        message: "hello"
    });
});

const SERVER_PORT = process.env.PORT || 8090;

let server;

const startServer = async () => {
    try {
        // Connect to Oracle DB first
        await connectDB();

        // Start Express server
        server = app.listen(SERVER_PORT, () => {
            console.log(`Server started on port ${SERVER_PORT}`);
        });

    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};

const gracefulShutdown = async (signal) => {
    console.log(`${signal} received. Shutting down gracefully...`);

    try {
        if (server) {
            server.close(async () => {
                console.log("HTTP server closed");

                await disconnectDB();
                console.log("Database disconnected");

                process.exit(0);
            });
        } else {
            await disconnectDB();
            process.exit(0);
        }

    } catch (error) {
        console.error("Error during shutdown:", error);
        process.exit(1);
    }
};


// Handle unhandled Promise rejections
process.on("unhandledRejection", (err) => {
    console.error("Unhandled Rejection:", err);

    gracefulShutdown("UNHANDLED_REJECTION");
});


// Handle unexpected exceptions
process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);

    gracefulShutdown("UNCAUGHT_EXCEPTION");
});


// Handle container/server shutdown
process.on("SIGTERM", () => {
    gracefulShutdown("SIGTERM");
});


// Handle Ctrl+C
process.on("SIGINT", () => {
    gracefulShutdown("SIGINT");
});


startServer();