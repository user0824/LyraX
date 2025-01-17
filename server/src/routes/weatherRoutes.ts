// ------------------------------------------------------------------------------------------------
// > WEATHER ROUTES < //
// ------------------------------------------------------------------------------------------------
import express, { Request, Response } from "express";
import axios from "axios";
import weatherCodeMap from "../utils/weatherCodes";

const router = express.Router();
const weatherApi = process.env.TOMORROW_IO_API_KEY;

if (!weatherApi) {
  throw new Error("TOMORROW_IO_API_KEY is not defined in .env");
}

// ------------------------------------------------------------------------------------------------
// * GET WEATHER FROM TOMORROW IO - may switch to another api?!
// ------------------------------------------------------------------------------------------------
router.get("/", async (req: Request, res: Response) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      res
        .status(400)
        .json({ error: "Missing latitude and longitude params!!!" });
      return;
    }
    // const weatherResponse = await axios.get(weatherApi);
    const url = `https://api.tomorrow.io/v4/weather/realtime?location=${lat},${lon}&apikey=${weatherApi}`;

    const { data } = await axios.get(url);

    const temperature = data?.data?.values?.temperature;
    const weatherCode = data?.data?.values?.weatherCode;
    const description = weatherCodeMap[weatherCode] ?? "Unknown";

    res.status(200).json({ temperature, description, weatherCode });
  } catch (err) {
    console.error("Error fetching weather data:", err);
    res
      .status(500)
      .json({ error: `Failed to fetch weather data: ${String(err)}` });
  }
});

// ------------------------------------------------------------------------------------------------
// * MODULE EXPORT
// ------------------------------------------------------------------------------------------------
export default router;
