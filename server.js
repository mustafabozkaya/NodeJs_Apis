const mongoose = require("mongoose"); // npm i mongoose --save to install mongoose . This is needed to connect to the MongoDB database
const dotenv = require("dotenv"); // npm i dotenv --save to install dotenv . This is needed to read the .env file
dotenv.config({ path: "./config.env" }); // This is needed to read the .env file
const app = require("./app");
const cors = require("cors"); // npm i cors --save to install cors . This is needed to allow cross origin resource sharing (CORS) between the client and the server
app.get(cors()); // This is needed to allow cross origin resource sharing (CORS) between the client and the server

// const DB = process.env.DATABASE.replace('<PASSWORD>',
//   process.env.DATABASE_PASSWORD);

// const DB = 'mongodb://localhost:27017';

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((con) => {
    console.log("DB connection successfully");
  });

// console.log(app.get('env'));

const port = process.env.PORT || 5050; // This is needed to set the port number
app.listen(port, () => {
  console.log(`App is listening on ${port} `);
});
