const express = require('express');
const dataBaseConected = require('./src/Config/db');
const router = require('./src/Routes/route');
const cors = require('cors');
const path = require('path');
const userRouter = require('./src/Routes/userRoute');
require('dotenv').config();
const app = express();

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.get("/uploads/:filename", (req, res) => {
  const filePath = path.join(__dirname, "uploads", req.params.filename);
  res.download(filePath);
});
app.use(router)
app.use('/login', userRouter)
dataBaseConected();



const port = process.env.PORT || 3000 
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
