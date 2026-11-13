import express from 'express';
const app = express();
const PORT = process.env.PORT || 5500;

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', game: 'Wood Screw Master', version: '2.0.0' });
});

app.listen(PORT, () => {
  console.log(`Wood Screw Master server running on port ${PORT}`);
});
