const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const compression = require('compression')
const app = express();
const cors = require('cors');
const path = require('path');
const { searchPlace, addReview } = require('./controllers/placeController');


//init middlewares
app.use(morgan("dev"));
app.use(helmet());
app.use(compression);

app.use(cors());
app.use(express.json());

//int dba

//init router
app.get('/api/places/search', searchPlace);
app.post('/api/places/review', addReview);
const { searchPlace, addReview } = require('./backend/controllers/placeController');

app.get('/api/places/search', searchPlace);
app.post('/api/places/review', addReview); // Route nhận đánh giá từ giao diện gửi lên

//others
app.use(express.static(path.join(__dirname, '../frontend')));
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Không tìm thấy API route này!' });
});
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Lỗi server nội bộ!' });
});


//init handling error
module.exports = app;
