import app from './src/app.js';

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`API ToolsPrint escuchando en http://localhost:${port}`);
});
