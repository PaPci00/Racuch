import mysql from "mysql2/promise";

const db = await mysql.createConnection({
    host: "mysql-racuch.alwaysdata.net", // dokładny host z panelu AlwaysData
    user: "racuch",                      // login MySQL z panelu
    password: "dwE423x",                // hasło do MySQL
    database: "racuch_sql",        // np. pawel_tracker
    port: "3306"
});

console.log("✅ Połączono z MySQL!");
export default db;
