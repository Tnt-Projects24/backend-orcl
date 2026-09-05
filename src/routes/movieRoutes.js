import express from 'express';
import oracledb from "oracledb";
const router = express.Router();
import {
    connectDB,
    disconnectDB,
    getDBConnection
} from "../config/database.js";

router.get("/hello", (req,res) => {
    res.json({"message" : "Movies hello"});
} );

router.get("/", (req,res) => {
    res.json({"message" : "hello"});
} );

router.post("/", (req,res) => {
    res.json({"message" : "post"});
} )

router.post("/products", (req,res) => {
    res.json({"message" : "post"});
} )

router.get("/products", async (req, res) => {
    let connection;

    try {
        connection = await getDBConnection();

        const result = await connection.execute(
            "SELECT * FROM PRODUCT",[],{ outFormat: oracledb.OUT_FORMAT_OBJECT}
        );

        res.json(result.rows);

    } catch (error) {
        console.error("Error fetching products:", error);

        res.status(500).json({
            error: "Failed to fetch products",
            details: error.message
        });

    } finally {
        if (connection) {
            await connection.close();
        }
    }
});
export default router;
