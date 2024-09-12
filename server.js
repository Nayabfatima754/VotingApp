const express = require('express');
const app = express();
const db = require('./db');
require('dotenv').config();

// Use express.json() to parse JSON request bodies
app.use(express.json());
const { jwtAuthMiddleware} = require('./jwt');


const user_routes = require('./router/user_routes');
app.use('/user', user_routes);

const candidate_routes = require('./router/candidate_routes');
app.use('/candidate', candidate_routes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is live on port ${port}`);
});
