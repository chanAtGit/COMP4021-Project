const express = require("express"); // import express.js

const app = express(); //initialise express application

// Use the 'public' folder to serve static files
app.use(express.static("public"));

// Handle any GET requests for the path '/serverinfo'
app.get("/serverinfo", (req, res) => {
    res.json({ name: "Node.js Server is active." });
});

app.listen(8000); //start web server at port 800. IMPORTANT