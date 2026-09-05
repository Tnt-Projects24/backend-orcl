
import oracledb from "oracledb";
import { getDBConnection } from "../config/database.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";


const register = async (req, res) => {
    let connection;

    try {
        const { name, email, password } = req.body;

        connection = await getDBConnection();

        // Check whether the user already exists
        const result = await connection.execute(
            `
            SELECT id
            FROM app_users
            WHERE email = :email
            `,
            { email },
            {
                outFormat: oracledb.OUT_FORMAT_OBJECT
            }
        );

        const userExists = result.rows.length > 0;

        if (userExists) {
            return res.status(409).json({
                message: "User already exists"
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);

        console.log("Inserting into the table");

        // Insert user and return generated values
        const insertResult = await connection.execute(
            `
            INSERT INTO app_users (
                name,
                email,
                password
            )
            VALUES (
                :name,
                :email,
                :pass
            )
            RETURNING id, name, email, created_date
            INTO :id, :returnedName, :returnedEmail, :createdDate
            `,
            {
                name,
                email,
                pass: hashedPass,

                id: {
                    dir: oracledb.BIND_OUT,
                    type: oracledb.NUMBER
                },

                returnedName: {
                    dir: oracledb.BIND_OUT,
                    type: oracledb.STRING,
                    maxSize: 100
                },

                returnedEmail: {
                    dir: oracledb.BIND_OUT,
                    type: oracledb.STRING,
                    maxSize: 255
                },

                createdDate: {
                    dir: oracledb.BIND_OUT,
                    type: oracledb.DB_TYPE_TIMESTAMP
                }
            }
        );

        console.log("Row inserted");

        // Get values returned by Oracle
        const id = insertResult.outBinds.id[0];
        const returnedName = insertResult.outBinds.returnedName[0];
        const returnedEmail = insertResult.outBinds.returnedEmail[0];
        const createdDate = insertResult.outBinds.createdDate[0];

        console.log("Inserted user ID:", id);

        // Commit transaction
        await connection.commit();

        console.log("Commit is complete");

        // Generate JWT using the newly created user ID
        const token = generateToken(id,res);

        console.log("Sending response to client");

        return res.status(201).json({
            message: `User ${returnedName} registered successfully`,
            rowsAffected: insertResult.rowsAffected,
            data: {
                user: {
                    id,
                    name: returnedName,
                    email: returnedEmail,
                    createdDate
                },
                token
            }
        });

    } catch (error) {

        console.error("Error registering user:", error);

        // Rollback if something failed
        if (connection) {
            try {
                await connection.rollback();
                console.log("Transaction rolled back");
            } catch (rollbackError) {
                console.error("Rollback failed:", rollbackError);
            }
        }

        return res.status(500).json({
            error: "Registration failed",
            details: error.message
        });

    } finally {

        console.log("Finally: closing connection");

        if (connection) {
            await connection.close();
        }

        console.log("Finally: connection closed");
    }
};


const login = async (req, res) => {
    let connection;

    try {
        console.log("Request method:", req.method);
        console.log("Request URL:", req.originalUrl);
        console.log("Content-Type:", req.headers["content-type"]);
        console.log("Request body:", req.body);

        // Make sure request body exists
        if (!req.body) {
            return res.status(400).json({
                error: "Request body is missing"
            });
        }

        const { email, password } = req.body;

        connection = await getDBConnection();

        // Find user by email
        const result = await connection.execute(
            `
            SELECT
                id,
                name,
                email,
                password
            FROM app_users
            WHERE email = :email
            `,
            { email },
            {
                outFormat: oracledb.OUT_FORMAT_OBJECT
            }
        );

        // User not found
        if (result.rows.length === 0) {
            return res.status(401).json({
                error: "Invalid email or password"
            });
        }

        const user = result.rows[0];

        // Compare entered password with hashed password
        const passwordMatches = await bcrypt.compare(
            password,
            user.PASSWORD
        );

        if (!passwordMatches) {
            return res.status(401).json({
                error: "Invalid email or password"
            });
        }

        // Login successful
        const token = generateToken(user.ID,res);

        return res.status(200).json({
            message: "Login successful",
            data: {
                user: {
                    id: user.ID,
                    name: user.NAME,
                    email: user.EMAIL
                },
                token
            }
        });

    } catch (error) {

        console.error("Error logging in:", error);

        return res.status(500).json({
            error: "Login failed",
            details: error.message
        });

    } finally {

        console.log("Finally: closing connection");

        if (connection) {
            await connection.close();
        }

        console.log("Finally: connection closed");
    }
};

const logout = async (req, res) => {
    res.cookie("jwt","",{
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({
        message: "Successfully logged out",
        status: "success"
    });
};
export { register, login,logout };
