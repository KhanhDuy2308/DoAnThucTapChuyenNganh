
const mongoose = require('mongoose');



require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan  = require('morgan');
const helmet  = require('helmet');
const compression  = require('compression');

const app = express();
app.use(cors());
app.use(express.json());
app.use(compression());
app.use(morgan("dev"));
app.use(helmet());


// API 
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'Server OK' });
});

// route
const { searchPlace, addReview } = require('./backend/controllers/placeController');
app.get('/api/places/search', searchPlace);
app.post('/api/places/review', addReview);

const PORT = 3000; 


const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/DoAnThucTap';

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB chạy OK!'))
  .catch(err => console.error(' Lỗi kết nối MongoDB:', err));

app.listen(PORT, () => {
  console.log(` Server Chạy Tại: http://localhost:${PORT}`);
});