// Express server setup
import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import bodyParser from 'body-parser';
import bcrypt from 'bcryptjs';
 import CryptoJS from 'crypto-js';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = express();

const algorithm = 'aes-256-cbc';
const key = "mypasswith32chars>>AES_256_bytes";//crypto.randomBytes(32);
const iv = crypto.randomBytes(16); //inicialization vector

function encrypt(text) {
 let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
 let encrypted = cipher.update(text);
 encrypted = Buffer.concat([encrypted, cipher.final()]);
 return JSON.stringify({ iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') });
}

function decrypt(text) {
 let iv = Buffer.from(text.iv, 'hex');
 let encryptedText = Buffer.from(text.encryptedData, 'hex');
 let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
 let decrypted = decipher.update(encryptedText);
 decrypted = Buffer.concat([decrypted, decipher.final()]);
 return decrypted;
}

const hashData = (data) => {
    const hash = crypto.createHash('md5');
    hash.update(data);
    return hash.digest('hex');
  };

const comparePasswords = (inputPassword, storedHash) => {
    const inputHash = hashData(inputPassword);
    return inputHash === storedHash;
  };

server.use(express.json());
server.use(bodyParser.json());

server.use(express.static(path.join(__dirname, 'views')));

mongoose.connect('mongodb://localhost:27017/cryptography', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const schema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    address: String,
    phone: String,
});

const User = mongoose.model('user', schema);

server.get('/', async (req, res) => {
    res.send("Welcome to my project");
});

server.get('/home', async (req, res) => {
    res.sendFile(path.join(__dirname,"views", "index.html"));
});

server.post('/signup', async (req, res) => {
    // Data Manipulation
    console.log(req.body)
    // const hack = JSON.parse(req.body.userData);
    // hack.email = "hacker.gmail.com";
    // const ud = JSON.stringify(hack);
    // req.body.userData = ud;

    //console.log(req.body);
    try {
      const {name, email, password, address, phone, signature, hash, userData } = req.body;  
  
      // Verify the integrity of the data
      const dataHash = CryptoJS.HmacSHA256(userData, 'your-secret-key').toString(CryptoJS.enc.Hex);
      if (dataHash !== signature) {
        return res.status(400).json({ success: false, message: 'Data integrity check failed' });
      }
  
      // Check if email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
  
      // Hash the password
    //   const hashedPassword = await bcrypt.hash(password, 10);
    const hashedPassword= hashData(password);
    console.log("md5 hash: " + hashedPassword);
    const encryptName= encrypt(name);
    const encryptAddress= encrypt(address);
    const encryptPhone= encrypt(phone);
      
      const jsonUser = JSON.parse(userData);
      console.log(userData)
      // Save the user
      const newUser = new User({
        name: encryptName,
        email: jsonUser.email,
        password: hashedPassword,
        phone: encryptPhone,
        address: encryptAddress
      }); 
  
      await newUser.save();
  
      res.json({ success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
  });

  server.post('/login', async (req, res) => {
    console.log(req.body);
    try {
      const { email, password } = req.body;
  
      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ success: false, message: 'Invalid email or password' });
      }
  
      // Verify password
    //   const isMatch = await bcrypt.compare(password, user.password);
    const isMatch= comparePasswords(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Invalid email or password' });
      }
  
      res.json({ success: true });
    } catch (err) {
        console.log(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });


const PORT = 4001;
server.listen(PORT, () => {
    console.log("Server is listening at " + PORT);
});