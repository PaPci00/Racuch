import express from "express";
import db from "./db.js";

const app = express();
app.use(express.json());

// TEST – sprawdzenie połączenia z bazą
app.get("/test", async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM categories");
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Błąd bazy danych" });
    }
});
