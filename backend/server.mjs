import express from "express";
import cors from "cors";
import { getCityCode } from "./amadeus.mjs"; // Import as ES module

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/cities", async (req, res) => {
    const city = req.query.city;
    if (!city) {
        return res.status(400).json({ error: "City name is required" });
    }

    const cityData = await getCityCode(city);
    res.json(cityData);
});

const PORT = 5001;
app.listen(PORT, () => console.log(`Node.js server running on port ${PORT}`));
