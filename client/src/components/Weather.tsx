// --------------------------------------------------------------------------------------
// > WEATHER COMPONENT < //
// --------------------------------------------------------------------------------------

import React, { useEffect, useState } from "react";
import axios from "axios";

interface WeatherData {
  temperature: number;
  description: string;
  weatherCode: number;
}

// FIND CITY NAME BASED ON LAT/LON
interface NominatimResult {
  display_name: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state?: string;
  };
}

const baseUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

const WeatherComponent: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await axios.get<WeatherData>(
              `${baseUrl}/api/weather`,
              {
                params: { lat: latitude, lon: longitude },
              },
            );

            setWeather(response.data);

            const geoUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`;
            const geoResp = await axios.get<NominatimResult>(geoUrl);

            if (geoResp.data.address) {
              const { city, town, village, county, state } =
                geoResp.data.address;
              // PREFER CITY/TOWN/VILLAGE FIRST, FALLBACK TO COUNTY IF NO CITY
              const cityName =
                city || town || village || county || "Unknown City";
              const stateName = state || "Unknown State/Province";

              setLocationName(`${cityName}, ${stateName}`);
            } else {
              // FALLBACK IF ADDRESS IS MISSING
              setLocationName("Unknown City, Unknown State");
            }
          } catch (err) {
            if (axios.isAxiosError(err)) {
              setError(err.response?.data?.error || err.message);
            } else {
              setError("An unexpected error occurred");
            }
          } finally {
            setLoading(false);
          }
        },
        (err) => {
          setError(err.message);
          setLoading(false);
        },
      );
    } else {
      setError("Geolocation is not supported by this browser.");
      setLoading(false);
    }
  }, []);

  if (loading) return <p>Loading weather data...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!weather) return null;

  const { temperature, description, weatherCode } = weather;
  const temp = Math.round(temperature); // * remove integers from temp
  const imgUrl = "./src/assets/";

  const iconMapping: Record<number, string> = {
    // 0: "Unknown",
    1000: `${imgUrl}clear_day.svg`,
    1100: `${imgUrl}mostly_clear_day.svg`,
    1101: `${imgUrl}partly_cloudy_day.svg`,
    1102: `${imgUrl}mostly_cloudy.svg`,
    1001: `${imgUrl}cloudy.svg`,
    2000: `${imgUrl}fog.svg`,
    2100: `${imgUrl}fog.svg`,
    4000: `${imgUrl}drizzle.svg`,
    4001: `${imgUrl}rain.svg`,
    4200: `${imgUrl}rain_light.svg`,
    4201: `${imgUrl}rain_heavy.svg`,
    5000: `${imgUrl}snow.svg`,
    5001: `${imgUrl}flurries.svg`,
    5100: `${imgUrl}snow_light.svg`,
    5101: `${imgUrl}snow_heavy.svg`,
    6000: `${imgUrl}freezing_drizzle.svg`,
    6001: `${imgUrl}freezing_rain.svg`,
    6200: `${imgUrl}freezing_rain_light.svg`,
    6201: `${imgUrl}freezing_rain_heavy.svg`,
    7000: `${imgUrl}ice_pellets.svg`,
    7101: `${imgUrl}ice_pellets_heavy.svg`,
    7102: `${imgUrl}ice_pellets_light.svg`,
    8000: `${imgUrl}tstorm.svg`,
  };

  const iconSrc = iconMapping[weatherCode];

  return (
    <div className="flex flex-col items-center justify-center">
      {iconSrc && iconSrc !== "Unknown" ? (
        <img
          className="mb-0"
          src={iconSrc}
          alt={description}
          width="128"
          height="128"
        />
      ) : (
        <p>{description}</p>
      )}
      {/* <h2>Current Weather</h2> */}
      <p className="mb-2 text-5xl font-bold text-indigo-100">{temp}°C</p>
      <p className="mb-2 text-xl text-indigo-400">{description}</p>
      {locationName ? (
        <p className="text-indigo-100">
          <span></span>
          {locationName}
        </p>
      ) : null}
      {/* <p>Weather Code: {weather.weatherCode}</p> */}
    </div>
  );
};

// ------------------------------------------------------------------------------------------------
// * MODULE EXPORT
// ------------------------------------------------------------------------------------------------
export default WeatherComponent;
