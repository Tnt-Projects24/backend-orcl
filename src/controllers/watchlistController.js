import oracledb from "oracledb";
import { getDBConnection } from "../config/database.js";


const getWatchlist = async (req, res) => {

    let connection;

    try {

        const { userId } = req.params;

        connection = await getDBConnection();

        const result = await connection.execute(
            `
            SELECT
                id,
                user_id,
                movie_id,
                created_at
            FROM watchlist_items
            WHERE user_id = :userId
            ORDER BY created_at DESC
            `,
            {
                userId
            },
            {
                outFormat: oracledb.OUT_FORMAT_OBJECT
            }
        );

        return res.status(200).json({
            data: result.rows
        });

    } catch (error) {

        console.error("Error fetching watchlist:", error);

        return res.status(500).json({
            error: "Failed to fetch watchlist",
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


const addToWatchlist = async (req, res) => {

    let connection;

    try {

        const { userId, movieId,status } = req.body;

        console.log("userId:", req.user.ID);
        console.log("movieId:", movieId);
        console.log("status:", status);
        connection = await getDBConnection();

        // Check whether movie already exists in the watchlist
        const existingResult = await connection.execute(
            `
            SELECT id
            FROM watchlist_items
            WHERE user_id = :userId
            AND movie_id = :movieId
            `,
            {
                userId: req.user.ID,
                movieId
            },
            {
                outFormat: oracledb.OUT_FORMAT_OBJECT
            }
        );

        if (existingResult.rows.length > 0) {

            return res.status(409).json({
                message: "Movie already exists in watchlist"
            });
        }

        // Insert movie into watchlist
        const insertResult = await connection.execute(
    `
    INSERT INTO watchlist_items (
        user_id,
        movie_id,
        status,
        created_at,
        updated_at
    )
    VALUES (
        :userId,
        :movieId,
        :status,
        SYSTIMESTAMP,
        SYSTIMESTAMP
    )
    RETURNING
        id,
        user_id,
        movie_id,
        status,
        rating,
        notes,
        created_at,
        updated_at
    INTO
        :id,
        :returnedUserId,
        :returnedMovieId,
        :returnedStatus,
        :returnedRating,
        :returnedNotes,
        :createdAt,
        :updatedAt
    `,
    {
        userId: req.user.ID,
        movieId,
        status,

        id: {
            dir: oracledb.BIND_OUT,
            type: oracledb.NUMBER
        },

        returnedUserId: {
            dir: oracledb.BIND_OUT,
            type: oracledb.NUMBER
        },

        returnedMovieId: {
            dir: oracledb.BIND_OUT,
            type: oracledb.NUMBER
        },

        returnedStatus: {
            dir: oracledb.BIND_OUT,
            type: oracledb.STRING,
            maxSize: 50
        },

        returnedRating: {
            dir: oracledb.BIND_OUT,
            type: oracledb.NUMBER
        },

        returnedNotes: {
            dir: oracledb.BIND_OUT,
            type: oracledb.STRING,
            maxSize: 4000
        },

        createdAt: {
            dir: oracledb.BIND_OUT,
            type: oracledb.DB_TYPE_TIMESTAMP
        },

        updatedAt: {
            dir: oracledb.BIND_OUT,
            type: oracledb.DB_TYPE_TIMESTAMP
        }
    }
);

        await connection.commit();

        const id = insertResult.outBinds.id[0];
        const returnedUserId = insertResult.outBinds.returnedUserId[0];
        const returnedMovieId = insertResult.outBinds.returnedMovieId[0];
        const createdDate = insertResult.outBinds.createdAt[0];

        return res.status(201).json({
            message: "Movie added to watchlist successfully",
            data: {
                id,
                userId: returnedUserId,
                movieId: returnedMovieId,
                createdDate
            }
        });

    } catch (error) {

        console.error("Error adding movie to watchlist:", error);

        if (connection) {
            try {
                await connection.rollback();
                console.log("Transaction rolled back");
            } catch (rollbackError) {
                console.error("Rollback failed:", rollbackError);
            }
        }

        return res.status(500).json({
            error: "Failed to add movie to watchlist",
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


const removeFromWatchlist = async (req, res) => {

    let connection;

    try {

        const { id } = req.params;

        connection = await getDBConnection();

        const result = await connection.execute(
            `
            DELETE FROM watchlist_items
            WHERE id = :id
            `,
            {
                id
            }
        );

        if (result.rowsAffected === 0) {

            return res.status(404).json({
                message: "Watchlist item not found"
            });
        }

        await connection.commit();

        return res.status(200).json({
            message: "Movie removed from watchlist successfully"
        });

    } catch (error) {

        console.error("Error removing movie from watchlist:", error);

        if (connection) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error("Rollback failed:", rollbackError);
            }
        }

        return res.status(500).json({
            error: "Failed to remove movie from watchlist",
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

export {
    getWatchlist,
    addToWatchlist,
    removeFromWatchlist
};