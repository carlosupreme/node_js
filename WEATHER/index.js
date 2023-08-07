import { config } from "dotenv";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import chalk from "chalk";

config();

const KEY = process.env.WEATHER_API_KEY;
const rl = readline.createInterface({ input, output });
const city = process.argv[2] ?? (await rl.question("Introduce el nombre de la ciudad: "));
const cities = await getCitiesOptions(city);

if (!cities.length) {
  console.log(chalk.red("No hay datos de esa ciudad 😓"));
  process.exit(0);
}

const weather = await getWeather(cities[await selectCity(cities)]);
rl.close();
await displayWeather(weather);

async function getCitiesOptions(city) {
  let cities = [];
  try {
    const res = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=10&appid=${KEY}`);

    if (!res.ok) throw { err: res.statusText, status: res.status };
    cities = await res.json();

  } catch (error) {
    console.warn(chalk.yellowBright(error.err || "Error obteniendo las ciudades"));
    console.warn(chalk.yellowBright(error.status));
  }

  return cities;
}

async function selectCity(cities) {
  console.log(chalk.red("🌄🌄🌄 Lista de ciudades parecidas 🌄🌄🌄"));
  cities.forEach((city, i) => console.log(chalk.greenBright(`${i + 1}.- ${city.name}, ${city.state || ""} ${city.country}`)));

  const city = await rl.question(`De las ciudades mostradas, elige un numero del 1 - ${cities.length}: `);

  if (isNaN(city)) return selectCity(cities);

  return city - 1;
}

async function getWeather(city) {
  let weather = null;
  console.log(chalk.black("➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖"));
  console.log(`Has elegido la ciudad de: 📍 ${chalk.red(city.name)}`);
  console.log(`🌎🌎 Visitala en Google Maps: https://www.google.com/maps?q=${city.lat},${city.lon}`);

  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&appid=${KEY}&units=metric&lang=es`);

    if (!res.ok) throw new Error("Error con la longitud y latitud");

    const json = await res.json();
    weather = json;
    
  } catch (error) {
    console.warn(error);
  }

  return weather;
}

async function displayWeather(weather) {
  const airQualityValues = {
    0: "No obtenida",
    1: "Buena 😁",
    2: "Razonable 😀",
    3: "Moderada 😐",
    4: "Pobre 😕",
    5: "Muy pobre 😩",
  };
  const airQuality = airQualityValues[await getAirPollution(weather.coord.lat, weather.coord.lon)];

  console.log(`☁☁☁☁☁☁☁☁☁☁☁ Clima en ${weather.name}: ${weather.weather[0].main}, ${weather.weather[0].description} ☁☁☁☁☁☁☁☁☁☁☁`);
  console.log(`🌡  Temperatura: ${weather.main.temp} °C`);
  console.log(`🤒 Sensación térmica: ${weather.main.feels_like} °C`);
  console.log(`💧 Humedad: ${weather.main.humidity}%`);
  console.log(`🌬  Viento: ${weather.wind.speed} m/s`);
  console.log(`🌝 Amanecer: ${new Date(1000 * weather.sys.sunrise).toLocaleString("es", {hour12: true,})}`);
  console.log(`🌚 Atardecer: ${new Date(1000 * weather.sys.sunset).toLocaleString("es", {hour12: true,})}`);
  console.log(`🍃 Calidad del aire: ${airQuality}`);
}

async function getAirPollution(lat, lon) {
  try {
    const res = await fetch(`http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${KEY}`);

    if (!res.ok) throw res;

    const json = await res.json();

    return json.list[0].main.aqi;
   
  } catch (error) {
    return 0;
  }
}
