const express = require("express");
const bodyParser = require("body-parser");

const connectDB = require("./config/database");
const User = require("./models/user");
const usersRoutes = require("./routers/routers");

const app = express();

connectDB();

app.use(bodyParser.json());

app.use("/api/users", usersRoutes);

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
