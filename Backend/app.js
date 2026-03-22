const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const authRoutes = require('./routes/authRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const cookieParser = require('cookie-parser');
const { errorHandler } = require('./middleware/errorhandler');
const app = express();
app.use(helmet());
app.use(cors({
    origin:process.env.FRONTEND_URL,
    credentials:true,
}))
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth',authRoutes);
app.use('/api/subscriptions',subscriptionRoutes);

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});
app.use(errorHandler);
module.exports=app;