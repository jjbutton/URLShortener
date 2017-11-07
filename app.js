const validUrl = require("valid-url");
const mongo = require("mongodb").MongoClient;
const express = require("express");
const app = express();

// Display overview and insturctions at root
app.get("/", function (req, res) {
    res.send(parseInput(req.params.input));
});

// Read and validate any input
app.get("/:input", function (req, res) {
    const inputUrl = req.params.input;
    console.log("input", inputUrl)
    res.send(inputUrl);

    // If valid, insert into DB and return short url
    if(isHttpUri(inputUrl) || isHttpsUri(inputUrl)) {
        console.log('Good');
    } else {
        console.log('Invalid URL');
    }

    // if not valid, display an error
});


app.listen(3200, () => console.log("Listening..."));