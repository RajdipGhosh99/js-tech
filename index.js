const express = require('express');
const app = express();
const env = require('./constants')
require('./dbModule/db.connection');
const route1 = require('./objectModule/index')

// Middleware to parse incoming JSON requests
app.use(express.json());

app.get('/', (req, res) => {
    res.send("<h1>Express is running...</h1>")
})

app.use('/api/v1', route1)

app.use((error, req, res, next) => {
    console.log(error);
    res.json({
        status: 'error',
        error: error,
    })
})

// Start the server
app.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT} 🔥`);
});
