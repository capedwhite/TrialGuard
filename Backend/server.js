
const dotenv = require("dotenv");
dotenv.config();
const app = require("./app");
const { startScheduler } = require("./jobs/scheduler");

const port = process.env.PORT || 3000;
const server = app.listen(port,()=>{
console.log(`Server running on port ${port} in ${process.env.NODE_ENV} mode`);
startScheduler();
})
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});