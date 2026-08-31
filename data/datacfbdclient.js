import axios from "axios";

export const cfbd = axios.create({
  baseURL: "https://api.collegefootballdata.com",
  headers: {
    Authorization: `Bearer ${process.env.CFBD_API_KEY}`,
  },
});
