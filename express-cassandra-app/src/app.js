const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Import routes
const authorRoutes = require('./routes/author');
const bookRoutes = require('./routes/book');
const reviewRoutes = require('./routes/review');
const salesByYearRoutes = require('./routes/salesByYear');
const tablesRoutes = require('./routes/tables');
const top10Books = require('./routes/top10Books');
const search = require('./routes/search');
const top50Books = require('./routes/top50Books');

// Use routes
app.use('/api', authorRoutes);
app.use('/api', bookRoutes);
app.use('/api', reviewRoutes);
app.use('/api', salesByYearRoutes);
app.use('/api', tablesRoutes);
app.use('/api', top10Books);
app.use('/api', search);
app.use('/api', top50Books);


// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, '../public')));

// Root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
