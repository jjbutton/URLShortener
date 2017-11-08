const MongoClient = require("mongodb").MongoClient;
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


    const collectionName = "url";
    MongoClient.connect(`mongodb://localhost:27017/${collectionName}`, function (err, db) {
        if (err) {
            throw err;
        }
        console.log("Successfully connected to MongoDB.");

        // Check if url exists inside DB
        const query = { longUrl: inputUrl };
        console.log("query", query);
        db.collection(collectionName).find(query).toArray(function (err, url) {
            if (err) {
                throw err;
            }

            // FOUND!
            if (url.length > 0) {
                // console.log("url", url);
                console.log("Found", url[0].longUrl, url[0].shortUrl, url[0].id);
                res.send("Send 1" + url[0].shortUrl);
            } else {
                // Insert into DB 
                const urlToInsert = {
                    longUrl: inputUrl,
                    shortUrl: baseAddress + "1",
                    id: 1,
                }

                db.collection(collectionName).insertOne(urlToInsert, function (err, res) {
                    if (err) {
                        throw err;
                    }
                    console.log("Inserted document with _id: " + res.insertedId + "\n");
                });
                // Return short url
                res.send("Send 2" + urlToInsert.shortUrl);
            }
        });
    });
});

// Display overview and insturctions at root
app.get("/", function (req, res) {
    res.send(parseInput(req.params.input));
});


app.listen(3200, () => console.log("Listening..."));