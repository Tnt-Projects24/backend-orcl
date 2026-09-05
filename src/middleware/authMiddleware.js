import jwt from "jsonwebtoken";
import oracledb from "oracledb";
import { getDBConnection } from "../config/database.js";

export const authMiddleware = async (req, res, next) => {

    console.log("Auth middleware reached");

    let token;
    let connection;

    // Get token from Authorization header
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer ")
    ) {
        token = req.headers.authorization.split(" ")[1];

    // Get token from cookie
    } else if (req.cookies && req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return res.status(401).json({
            error: "Not authorized; no token provided"
        });
    }

    try {

        // Verify JWT
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        console.log("Decoded JWT:", decoded);

        // Get user ID from JWT
        const userId = decoded.id;

        if (!userId) {
            return res.status(401).json({
                error: "Not authorized; invalid token"
            });
        }

        // Connect to database
        connection = await getDBConnection();

        // Verify user exists
        const result = await connection.execute(
            `
            SELECT
                id,
                name,
                email
            FROM app_users
            WHERE id = :userId
            `,
            {
                userId
            },
            {
                outFormat: oracledb.OUT_FORMAT_OBJECT
            }
        );

        // User doesn't exist
        if (result.rows.length === 0) {
            return res.status(401).json({
                error: "Not authorized; user does not exist"
            });
        }

        // Attach user to request
        req.user = result.rows[0];

        console.log("Authenticated user:", req.user);

        // Continue to controller
        next();

    } catch (error) {

        console.error("Authentication error:", error);

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                error: "Not authorized; invalid token"
            });
        }

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                error: "Not authorized; token expired"
            });
        }

        return res.status(500).json({
            error: "Authentication failed",
            details: error.message
        });

    } finally {

        if (connection) {
            await connection.close();
        }
    }
};