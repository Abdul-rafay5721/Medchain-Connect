require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path'); // ✅ for handling paths
const connectDB = require('./config/db');

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

// ✅ Serve static files from the dist folder
app.use(express.static("public"))
app.use(express.static("./dist"))

// ✅ Your API routes
app.use('/api/grant-access', require('./routes/grantAccess'));

// ✅ Catch-all route to serve index.html for SPA
app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile("index.html", { root: "./dist" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
