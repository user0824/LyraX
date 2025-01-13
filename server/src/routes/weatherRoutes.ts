// !! NOT IMPLEMENTED OR SETUP YET !!
// ------------------------------------------------------------------------------------------------
// > WEATHER ROUTES < //
// ------------------------------------------------------------------------------------------------
import express, { Request, Response } from "express";
import axios from "axios";

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
    const weatherResponse = await axios.get(weatherApi);

    res.status(200).json(weatherResponse.data);
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
