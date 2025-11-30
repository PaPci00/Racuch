import mysql from "mysql2/promise";

import dotenv from "dotenv";
dotenv.config();

const db = await mysql.createConnection({
    host: process.env.DB_HOST, // dokładny host z panelu AlwaysData
    user: process.env.DB_USER,                      // login MySQL z panelu
    password: process.env.DB_PASSWORD,                // hasło do MySQL
    database: process.env.DB_NAME,        // np. pawel_tracker
    port: process.env.DB_PORT
});

console.log("✅ Połączono z MySQL!");
export default db;
