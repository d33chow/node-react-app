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

	let sql = `SELECT m.name, m.id, m.year, GROUP_CONCAT(DISTINCT d.first_name, " ", d.last_name SEPARATOR ', ') as directorName, GROUP_CONCAT(a.first_name, " ", a.last_name, " as ", r.role) as actorName
	FROM movies_directors md, directors d, actors a, movies m
	LEFT JOIN roles r ON r.movie_id = m.id
	WHERE m.id = md.movie_id
	AND md.director_id = d.id
	AND r.actor_id = a.id
    GROUP BY m.name, m.year, m.id
	ORDER BY year desc`;
	let data = [];

	connection.query(sql, data, (error, results, fields) => {
		if (error) {
			return console.error(error.message);
		}

		for (var i = 0; i < results.length; i++) {
			let actorString = results[i].actorName;
			let actorArray = actorString.split(',');
			results[i].actorName = actorArray;
		}

		let string = JSON.stringify(results);
		let obj = JSON.parse(string);
		res.send({ express: string });
	});
});

app.post('/api/loadReviews', (req, res) => {
	let connection = mysql.createConnection(config);

	let sql = `SELECT * FROM review r, movies m WHERE r.reviewedMovieID = m.id ORDER BY r.reviewID desc`;
	let data = [];

	connection.query(sql, data, (error, results, fields) => {
		if (error) {
			return console.error(error.message);
		}
		let string = JSON.stringify(results);
		let obj = JSON.parse(string);
		res.send({ express: string });
	});
});

app.post('/api/findActors', (req, res) => {
	let connection = mysql.createConnection(config);
	let actorSearchTerm = req.body.actorSearchTerm;

	let sql = `SELECT a.id, CONCAT(a.first_name, " ", a.last_name) as actorName, COUNT(DISTINCT r.role) AS freq, GROUP_CONCAT(DISTINCT r.role, " (", m.name, ")") as roles, GROUP_CONCAT(g.genre) as genres
	FROM movies m
    LEFT JOIN movies_genres g on m.id = g.movie_id,
    actors a
    LEFT JOIN roles r ON a.id = r.actor_id
	WHERE CONCAT(a.first_name, " ", a.last_name) LIKE ?
    AND m.id = r.movie_id
	GROUP BY a.id
	ORDER BY COUNT(r.actor_id) DESC
	LIMIT 20;`;
	let data = [actorSearchTerm];

	connection.query(sql, data, (error, results, fields) => {
		if (error) {
			return console.error(error.message);
		}

		for (var i = 0; i < results.length; i++) {
			if (results[i].roles != null) {
				let rolesString = results[i].roles;
				let rolesArray = rolesString.split(',');
				results[i].roles = rolesArray;
			}

			if (results[i].roles != null) {
				let genresString = results[i].genres;
				let genresArray = genresString.split(',');
				results[i].genres = genresArray;
			}
		}
		let string = JSON.stringify(results);
		let obj = JSON.parse(string);
		res.send({ express: string });
	});
});

app.post('/api/submitReview', (req, res) => {
	let connection = mysql.createConnection(config);
	let title = req.body.title
	let body = req.body.body
	let score = req.body.score
	let movie = req.body.movieID
	let insertReviewData = [title, body, score, movie];

	let sql = `INSERT INTO review (reviewTitle, reviewContent, score, reviewedMovieID) VALUES (?)`;
	let data = [insertReviewData];

	console.log(data)

	connection.query(sql, data, (error, results, fields) => {
		console.log(results);
		if (error) {
			return console.error(error.message);
		}
		res.send("Success");
	});
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

app.post('/api/getCast', (req, res) => {

	let connection = mysql.createConnection(config);
	let title = req.body.title;

	let sql = `SELECT GROUP_CONCAT(a.first_name, " ", a.last_name) as cast 
	FROM actors a, roles r, movies m 
	WHERE a.id = r.actor_id
	AND m.id = r.movie_id
	AND m.name = ?`;
	let data = [title];

	connection.query(sql, data, (error, results, fields) => {
		if (error) {
			return console.error(error.message);
		}

		for (var i = 0; i < results.length; i++) {
			let actorString = results[i].actorName;
			let actorArray = actorString.split(',');
			results.actorName = actorArray;
		}

		let string = JSON.stringify(results);
		let obj = JSON.parse(string);
		res.send({ express: string });
	});
	connection.end();

});

app.post('/api/findMovies', (req, res) => {
	let connection = mysql.createConnection(config);
	let directorSearchTerm = req.body.directorSearchTerm;
	let actorSearchTerm = req.body.actorSearchTerm;
	let titleSearchTerm = req.body.titleSearchTerm;

	let data = [];

	let sql = `SELECT m.name, m.year, GROUP_CONCAT(DISTINCT r.reviewContent) as "content", (SUM(r.score) / COUNT(r.score)) as "averageScore", 
	GROUP_CONCAT(DISTINCT d.first_name, " ", d.last_name SEPARATOR ', ') as "directorName", 
	GROUP_CONCAT(DISTINCT a.first_name, " ", a.last_name) as "actorName"
	FROM directors d, movies_directors md, actors a, roles, movies m
    LEFT JOIN review r ON r.reviewedMovieID = m.id
	WHERE m.id = md.movie_id
	AND m.id = roles.movie_id
	AND a.id = roles.actor_id
	AND d.id = md.director_id`


	if (directorSearchTerm !== "%%") {
		sql = sql + ` AND CONCAT(d.first_name, " ", d.last_name) LIKE ?`;
		data.push(directorSearchTerm);
		console.log(directorSearchTerm);
	}

	if (actorSearchTerm !== "%%") {
		sql = sql + ` AND CONCAT(a.first_name, " ", a.last_name) LIKE ?`;
		data.push(actorSearchTerm);
		console.log(actorSearchTerm);
	}

	if (titleSearchTerm !== "%%") {
		sql = sql + ` AND m.name LIKE ?`
		data.push(titleSearchTerm);
		console.log(titleSearchTerm);
	}

	sql = sql + ` GROUP BY m.name, m.year`;

	console.log(sql);

	connection.query(sql, data, (error, results, fields) => {
		if (error) {
			return console.error(error.message);
		}

		for (var i = 0; i < results.length; i++) {
			if (results[i].content != null) {
				let reviewContentString = results[i].content;
				let reviewContentArray = reviewContentString.split(',');
				results[i].content = reviewContentArray;
			}

			let actorString = results[i].actorName;
			let actorArray = actorString.split(', ');
			results.actorName = actorArray;
		}

		let string = JSON.stringify(results);
		res.send({ express: string });
	});
	connection.end();

});

app.listen(port, () => console.log(`Listening on port ${port}`)); //for the dev version
//app.listen(port, '129.97.25.211'); //for the deployed version, specify the IP address of the server
