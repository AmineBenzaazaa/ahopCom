require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db/config');
const route = require('./controllers/route');

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));

// Bootstrap server with database connection
(async () => {
  try {
    await connectDB();
    app.use('/api', route);
    app.get('/', (req, res) => res.send('👋 Welcome to Prolink API!'));
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () =>
      console.log(`🚀 Server listening on http://127.0.0.1:${PORT}`)
    );
  } catch (err) {
    console.error('Startup failed:', err);
    process.exit(1);
  }
})();