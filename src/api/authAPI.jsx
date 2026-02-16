import axios from "axios";

const authAPI = axios.create({
  baseURL: "https://identitytoolkit.googleapis.com/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

export default authAPI;
