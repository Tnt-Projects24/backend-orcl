import dotenv from "dotenv";
import oracledb from "oracledb";


dotenv.config();

const dbConfig = {
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    connectString: process.env.DATABASE_URI,
    poolMin: Number(process.env.POOL_MIN),
    poolMax: Number(process.env.POOL_MAX),
    poolIncrement: Number(process.env.POOL_INCREMENT)
};

let pool;
console.log("DB Config:", {
    user: dbConfig.user,
    connectString: dbConfig.connectString,
    poolMin: Number(dbConfig.poolMin),
    poolMax: Number(dbConfig.poolMax),
    poolIncrement: Number(dbConfig.poolIncrement)
});

const connectDB = async () => {
    try {
        pool = await oracledb.createPool(dbConfig);

        console.log("Oracle connection pool created");

        // Test a database connection
        const connection = await pool.getConnection();

        console.log("Connected to Oracle Database");

        await connection.close();

    } catch (error) {
        console.error("Oracle connection pool error:", error);
        throw error;
    }
};

const getDBConnection = async () => {
    if (!pool) {
        throw new Error("Oracle connection pool has not been initialized");
    }

    return await pool.getConnection();
};

const disconnectDB = async () => {
    try {
        console.log("Closing DB session");
        if (pool) {
            await pool.close(10);
            console.log("Oracle connection pool closed");
        }else{
            console.log("DB Pool doesn;t exist");
        }
    } catch (error) {
        console.error("Oracle disconnect error:", error);
        throw error;
    }
};

export { connectDB, getDBConnection, disconnectDB };