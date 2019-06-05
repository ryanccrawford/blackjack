const express = require("express")
const path = require("path")
var app = express();
var PORT = process.env.PORT || 3000;

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());

app.get("/:info", function (req, res) {
    var l = req.params.info
    res.sendFile(path.join(__dirname, l));
});

app.listen(PORT, function () {
    console.log("App listening on PORT " + PORT);
});