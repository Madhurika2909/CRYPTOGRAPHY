// Express server setup
import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import bodyParser from 'body-parser';
// import bcrypt from 'bcryptjs';
// import CryptoJS from 'crypto-js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = express();

server.use(express.json());
server.use(bodyParser.json());

server.use(express.static(path.join(__dirname, 'views')));

mongoose.connect('mongodb://localhost:27017/cryptography', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const schema = new mongoose.Schema({
    email: String,
    password: String,
});

const User = mongoose.model('user', schema);

server.get('/', async (req, res) => {
    res.send("Welcome to my project");
});

const PORT = 4000;
server.listen(PORT, () => {
    console.log("Server is listening at " + PORT);
});