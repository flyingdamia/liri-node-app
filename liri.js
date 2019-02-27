// Requiring dotenv for secure storage of keys //

require("dotenv").config();

// Various variables for easy access //

var moment = require("moment");

var keys = require("./keys")

var axios = require("axios");

var Spotify = require('node-spotify-api');

var spotify = new Spotify({
    id: keys.spotify.id,
    secret: keys.spotify.secret
})

var fs = require("fs")

// storing cli arguments //

var command = process.argv[2]
var piece = process.argv.slice(3).join(" ");

// do-what-it-says function //

function doWhat() {
    if (command === 'do-what-it-says') {
// Reading information from random.txt and using it as search parameter //
        fs.readFile('./random.txt', 'UTF8', function(err, data) {
            if (err) {
                console.log("Cannot read File")
            }
            command = data.substring(0, data.indexOf(","))
            piece = data.substring(data.indexOf(",") + 2, data.length - 1)
            doWhat();
        })
    }
    
    else if (command === 'concert-this') {
        ConcertThis();
    }
    
    else if (command === 'spotify-this-song') {
        SpotifyThis()
    }
    
    else if (command === 'movie-this') {
        MovieThis();
    }
    
    else {
        console.log("Enter a valid command")
    }
}


// spotify-this-song function //

function SpotifyThis() {
    console.log("piece is: ")
    if (piece == "") {
        piece = "The Sign Ace of Base"
    }
    spotify.search({
        type: 'track',
        query: piece
    }, function(err, data) {
        if (err) {
            console.log("Error can't find your song")
        }
        var results = data.tracks.items[0]
        var artist = results.artists[0].name;
        var name = results.name;
        var preview = results.preview_url;
        var album = results.album.name;
        var output = ("\nArtist: " + artist + "\nSong Name: " + name + "\nPreview Link: " + preview + "\nAlbum: " + album + "\n---------------------------------");
        console.log(output)
        fs.appendFile('log.txt', output, 'utf8', function(error) {
            if (error) {
                console.log("Couldn't write.")
            }
            console.log("Data appended to file.")
        })
    })
}

// concert-this function and logic //
function ConcertThis() {
    if (piece == "") {
        console.log("You must include an artist.")
    }
    else {
        axios.get("https://rest.bandsintown.com/artists/" + piece + "/events?app_id=codingbootcamp")
        .then(function(response) {
            var results = response.data;
            for (i=0;i<results.length;i++) {
                var venue = results[i].venue.name;
                if (results[i].country === "United States") {
                    var location = results[i].venue.city + ", " + results[i].venue.region
                }
                else {
                    var location = results[i].venue.city + ", " + results[i].venue.country
                }
                var date = moment(results[i].datetime)
                date = date.format("MM/DD/YYYY")
                var output = ("\nVenue: " + venue + "\nLocation: " + location + "\nDate: " + date + "\n---------------------------------");
                console.log(output)
                fs.appendFile('log.txt', output, 'utf8', function(error) {
                    if (error) {
                        console.log("Couldn't write.")
                    }
                    console.log("Data appended file.")
                })
            }
        })
    }

}

// movie-this function and logic //

function MovieThis() {
    if (piece === "") {
        piece = "Mr. Nobody"
    }
    axios.get("http://www.omdbapi.com/?apikey=trilogy&t=" + piece)
    .then(function(response) {
        console.log(response.data.Title)
        results = response.data;
        var title = results.Title;
        var year = results.Year;
        ratingsArr = results.Ratings
        var IMDB = ratingsArr.filter(function(item) {
            return item.Source === 'Internet Movie Database'
        }).map(function(item) {
            return item.Value.toString()
        })
        IMDB = IMDB.toString();
        var RT = ratingsArr.filter(function(item) {
            return item.Source === 'Rotten Tomatoes'
        }).map(function(item) {
            return item.Value.toString()
        })
        RT = RT.toString();
        country = results.Country;
        language = results.Language;
        plot = results.Plot;
        actors = results.Actors;
        var output = ("\nTitle: " + title + "\nYear: " + year + "\nIMDB Rating: " + IMDB + "\nRotten Tomatoes Rating: " + RT + "\nCountry: " + country + "\nLanguage: " + language + "\nPlot: " + plot + "\nActors: " + actors + "\n---------------------------------")
        console.log(output)
        fs.appendFile('log.txt', output, 'utf8', function(error) {
            if (error) {
                console.log("Couldn't write.")
            }
            console.log("Data appended to file.")
        })
    })
}

doWhat();