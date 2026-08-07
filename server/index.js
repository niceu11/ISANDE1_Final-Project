import 'dotenv/config';
import { connectDB } from './src/db.js';
import app from './src/app.js';

const PORT = process.env.PORT || 4000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Soiree Hub API listening on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB!:', err.message);
    process.exit(1);
  });
