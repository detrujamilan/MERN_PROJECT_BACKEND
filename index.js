const express = require("express");
const cors = require("cors");
const connect = require("./config/db");
const morgan = require("morgan");
require("dotenv/config");
const app = express();

// middleware
app.use(express.json());
app.use("*",cors());
app.use(morgan("tiny"));

let baseUrl = process.env.APP_URL;

// Routes
const productsRoutes = require("./router/products");
const categoriesRoutes = require("./router/categories");
const ordersRoutes = require("./router/orders");
const usersRoutes = require("./router/users");

// models
app.use(`${baseUrl}/categories`, categoriesRoutes);
app.use(`${baseUrl}/products`, productsRoutes);
app.use(`${baseUrl}/users`, usersRoutes);
app.use(`${baseUrl}/orders`, ordersRoutes);

const port = 3001;

app.listen(port, () => {
  connect();
  console.log(`Server Is Running https://localhost:${port}`);
});
