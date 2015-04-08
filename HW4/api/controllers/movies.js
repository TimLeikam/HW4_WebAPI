var request = require("request");
var Usergrid = require("usergrid");

module.exports = {
	getMovies: getMovies,
	getMoviesUUID: getMoviesUUID,
	//getMovieByTitle: getMovieByTitle,
	getMovieByUUID: getMovieByUUID,
	postMovie: postMovie,
	deleteMovie: deleteMovie
}

//Return all movie titles, release dates, and actors
function getMovies (req, res) {
	//Request the collection
	request("http://api.usergrid.com/leikamt/sandbox/movies", function (err, response, body) {
		if (err) {
			res.send(err);
		}
		else {
			//Parse the data returned into easy to read json
			body = JSON.parse(body);
			body = body.entities;
			
			//Will be used to extract just the title, release date, and actor array
			var movie_list = [];
			var movie = {};
			
			for(i = 0; i < body.length; i++) {
				//Create a new JSON for the movie in body, and get its title, release date, and actor array
				movie = {title:body[i].title, releaseDate:body[i].releaseDate, actors:body[i].actors};
				
				//Push the new movie JSON into an array that will be returned
				movie_list.push(movie);
			}
			
			//Return the movie array that contains only titles, release dates, and actors
			res.send(movie_list);
		}
	});
}

//For testing delete without apigee access, lets you see the uuid of movies in the collection.
//Exact same as getMovies, except uuid is also returned for each movie
function getMoviesUUID (req, res) {
	request("http://api.usergrid.com/leikamt/sandbox/movies", function (err, response, body) {
		if (err) {
			res.send(err);
		}
		else {
			body = JSON.parse(body);
			body = body.entities;
			
			var movie_list = [];
			var movie = {};
			
			for(i = 0; i < body.length; i++) {
				movie = {uuid:body[i].uuid, title:body[i].title, releaseDate:body[i].releaseDate, actors:body[i].actors};
				movie_list.push(movie);
			}
			
			res.send(movie_list);
		}
	});
}

//Doesn't work
/*function getMovieByTitle (req, res) {
	var title = req.swagger.params.title.value;
	
	//request("http://api.usergrid.com/leikamt/sandbox/movies?ql=title=" + title, function(err, response, body) {
	request("http://api.usergrid.com/leikamt/sandbox/movies", function (err, response, body) {
		if (err) {
			res.send(err);
		}
		else {
			body = JSON.parse(body);
			body = body.entities;
			
			//var movie = {title:body.title, releaseDate:body.releaseDate, actors:body.actors};
			
			//res.send(movie);
			
			var movie = {};
			
			for(i = 0; i < body.length; i++) {
				if(body[i].title == title) {
					movie = {title:body[i].title, releaseDate:body[i].releaseDate, actors:body[i].actors};
				}
			}
			
			if(movie.title == undefined) {
				res.send("No movie with that title exists.");
			}
			else {
				res.send(movie);
			}
		}
	});
}*/

//Get a specific movie for the uuid sent in, and return its title, release date, and actors
function getMovieByUUID (req, res) {
	var uuid = req.swagger.params.uuid.value;
	
	request("http://api.usergrid.com/leikamt/sandbox/movies?ql=uuid=" + uuid, function(err, response, body) {
		if (err) {
			res.send(err);
		}
		else {
			body = JSON.parse(body);
			body = body.entities;
			
			var movie = {title:body[0].title, releaseDate:body[0].releaseDate, actors:body[0].actors};
			
			res.send(movie);
		}
	});
}

//Using header variables, post a new movie to the collection
function postMovie (req, res) {
	var title = req.swagger.params.title.value;
	var releaseDate = req.swagger.params.releaseDate.value;
	var a1 = req.swagger.params.a1.value;
	var a2 = req.swagger.params.a2.value;
	var a3 = req.swagger.params.a3.value;
	
	var dataClient = new Usergrid.client({
		orgName:'leikamt',
		appName:'sandbox'
	});
	
	var properties = {
		type: "movies",
		title: title,
		releaseDate: releaseDate,
		actors: [
			{
				name: a1
			},
			{
				name: a2
			},
			{
				name: a3
			}
		]
	}
	
	if(title == undefined || releaseDate == undefined || a1 == undefined
		|| a2 == undefined || a3 == undefined) {
			res.send("Error, not all data has values!");
	}
	
	dataClient.createEntity(properties, function (err, result) {
		if(err) {
			res.send("Error, could not create entity!");
		}
		else {
			res.send("Movie successfully added!");
		}
	});
}

//Delete the movie with the uuid that was passed in
function deleteMovie (req, res) {
	var uuid = req.swagger.params.uuid.value;
	
	var dataClient = new Usergrid.client({
		orgName:'leikamt',
		appName:'sandbox'
	});
	
	var properties = {
		client:dataClient,
		data:{
			'type':'movies',
			'uuid':uuid
		}
	};
	
	var entity = new Usergrid.entity(properties);
	
	entity.destroy(function (err, result) {
		if(err) {
			res.send(err);
		}
		else {
			res.send("Movie with uuid=" + uuid + " has been deleted!");
		}
	});
}