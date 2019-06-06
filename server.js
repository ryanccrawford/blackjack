const express = require("express")
const path = require("path")
var app = express();
var PORT = process.env.PORT || 3000;

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());

app.get("/", function (req, res) {
   res.sendFile(path.join(__dirname, "index.html"));
});
app.get("/index.html", function (req, res) {
    //var filePath = req.params.path
    var filePath = req.params.item
    console.log(filePath)
    res.sendFile(path.join(__dirname, "index.html"));
});
app.get("/index.html", function (req, res) {
    //var filePath = req.params.path
    var filePath = req.params.item
    console.log(filePath)
    res.sendFile(path.join(__dirname, "index.html"));
});
app.get("/:item", function (req, res) {
    //var filePath = req.params.path
    var filePath = req.params.item
    console.log(filePath)
    res.sendFile(path.join(__dirname, filePath));
});
app.get("/js/:item", function (req, res) {
    //var filePath = req.params.path
    var filePath = req.params.item
    console.log(filePath)
    res.sendFile(path.join(__dirname, "js/"+filePath));
});
app.get("/css/:item", function (req, res) {
    //var filePath = req.params.path
    var filePath = req.params.item
    console.log(filePath)
    res.sendFile(path.join(__dirname, "css/"+filePath));
});
app.get("/images/:item", function (req, res) {
    //var filePath = req.params.path
    var filePath = req.params.item
    console.log(filePath)
    res.sendFile(path.join(__dirname, "images/"+filePath));
});

app.listen(PORT, function () {
    console.log("App listening on PORT " + PORT);
});