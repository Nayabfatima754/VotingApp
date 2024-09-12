const mongoose = require('mongoose');
require('dotenv').config();

const mongoUrl = process.env.MONGODB_URL_LOCAL || process.env.MONGODB_URL;

mongoose.connect(mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('connected', () => {
  console.log("Connected to MongoDB server");
});

db.on('error', (err) => {
  console.error("MongoDB server connection error", err);
});

db.on('disconnected', () => {
  console.log("Disconnected from MongoDB server");
});

module.exports = db;
