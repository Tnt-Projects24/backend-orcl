import express from 'express';
const router = express.Router();
import {register,login,logout} from '../controllers/authController.js'


router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

// router.get("/products", async (req, res) => {
//     let connection;

//     try {
//         connection = await getDBConnection();

//         const result = await connection.execute(
//             "SELECT * FROM PRODUCT",[],{ outFormat: oracledb.OUT_FORMAT_OBJECT}
//         );

//         res.json(result.rows);

//     } catch (error) {
//         console.error("Error fetching products:", error);

//         res.status(500).json({
//             error: "Failed to fetch products",
//             details: error.message
//         });

//     } finally {
//         if (connection) {
//             await connection.close();
//         }
//     }
// });
export default router;
