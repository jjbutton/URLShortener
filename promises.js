"use strict";

const MongoClient = require("mongodb").MongoClient;
const co = require("co");
const express = require("express");
const app = express();

const baseAddress = "http://localhost/";

// Read and validate input
app.get("/new/*", function (req, res) {
    const inputUrl = req.params[0];
    console.log("input", inputUrl)

    const urlRegExp = /^(?:(?:https?):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/i;
    // if invalid, display error
    if (!urlRegExp.test(inputUrl)) {
        res.send("Invalid URL.");
        return;
    }


    const serverName = "localhost";
    const port = "27017";
    const collectionName = "url";

    co(function* () {
        const db = yield MongoClient.connect(`mongodb://${serverName}:${port}/${collectionName}`);
        console.log("Successfully connected to MongoDB.");

        // Check if url exists inside DB
        const query = { longUrl: inputUrl };
        console.log("query", query);
        const queryUrl = yield db.collection(collectionName).find(query).toArray();
        console.log("queryUrl", queryUrl);

        // FOUND!
        if (queryUrl.length > 0) {
            // console.log("url", url);
            console.log("Found", queryUrl[0].longUrl, queryUrl[0].shortUrl, queryUrl[0].id);
            res.send("Send 1" + queryUrl[0].shortUrl);
        } else {
            // Insert into DB 
            console.log("INSERTING...")
            const maxIDDocument = yield db.collection(collectionName).find().sort({ id: -1 }).limit(1).toArray();
            const maxID = maxIDDocument[0].id;
            console.log("MaxID", maxID);
            const newMaxID = maxIDDocument[0].id + 1;
            console.log("newMax", newMaxID);

            const urlToInsert = {
                longUrl: inputUrl,
                shortUrl: baseAddress + newMaxID,
                id: newMaxID,
            }
            const insertResult = yield db.collection(collectionName).insertOne(urlToInsert);
            console.log("Inserted document with _id: " + insertResult + "\n");

            // Return short url
            res.send("Send 2" + urlToInsert.shortUrl);
        }

    }).catch((err) => {
        console.log("err", err);
    });
});


// Display overview and insturctions at root
app.get("/", function (req, res) {
    res.send("Hi");
});


app.listen(3200, () => console.log("Listening..."));