let mysql = require('mysql');
let config = require('./config.js');
const fetch = require('node-fetch');
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

const { response } = require('express');
const app = express();
const port = process.env.PORT || 5000;
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(express.static(path.join(__dirname, "client/build")));

app.post('/api/loadMovies', (req, res) => {
	let connection = mysql.createConnection(config);

	let sql = `SELECT * FROM movies`;
	let data = [];

	connection.query(sql, data, (error, results, fields) => {
		if (error) {
			return console.error(error.message);
		}
		console.log(results);
		let string = JSON.stringify(results);
		let obj = JSON.parse(string);
		res.send({ express: string });
	});
});

app.post('/api/submitReview', (req, res) => {
	let connection = mysql.createConnection(config);
	let reviewID = req.body.reviewID
	let title = req.body.title
	let body = req.body.body
	let score = req.body.score
	let movie = req.body.movieID
	let insertReviewData = [reviewID, title, body, score, movie];

	let sql = `INSERT INTO review (reviewID, reviewTitle, reviewContent, score, reviewedMovieID) VALUES (?)`;
	let data = [insertReviewData];

	console.log(data)

	connection.query(sql, data, (error, results, fields) => {
		console.log(results);
		if (error) {
			return console.error(error.message);
		}
		res.send("Success");
	});

	console.log("Please insert the review");
});

app.post('/api/loadUserSettings', (req, res) => {

	let connection = mysql.createConnection(config);
	let userID = req.body.userID;
	console.log("UserID: ", userID);

	let sql = `SELECT mode FROM user WHERE userID = ?`;
	console.log(sql);
	let data = [userID];
	console.log(data);

	connection.query(sql, data, (error, results, fields) => {
		if (error) {
			return console.error(error.message);
		}

		let string = JSON.stringify(results);
		let obj = JSON.parse(string);
		res.send({ express: string });
	});
	connection.end();

});

app.listen(port, () => console.log(`Listening on port ${port}`)); //for the dev version
//app.listen(port, '129.97.25.211'); //for the deployed version, specify the IP address of the server
