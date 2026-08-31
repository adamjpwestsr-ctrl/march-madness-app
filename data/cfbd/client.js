import axios from "axios";
import dotenv from "dotenv";

// Load .env.local explicitly
dotenv.config({ path: ".env.local" });

console.log("Loaded CFBD key:", process.env.CFBD_API_KEY ? "YES" : "NO");

export const cfbd = axios.create({
  baseURL: "https://api.collegefootballdata.com",
  headers: {
    Authorization: `Bearer ${process.env.CFBD_API_KEY}`,
  },
});
