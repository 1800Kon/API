var express = require('express')
var mysql = require('mysql');
var validator = require('validator')
var app = express();
var validate = require('jsonschema').validate;
app.use(express.json());
const busiestAirportsSchema = require('./busiest_airports_schema.json')
const busiestAirportsSchemaUpdate = require('./busiest_airports_update_schema.json')
//Database connection
var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "api_database_dp"
});


//Function to connect to the database
function connectToDB() {
    connection.connect(function (err) {
        if (err) {
            return console.error(err.message);
        }
        console.log("Connected to database.");
    });
}

//Function to close a connection
function endconnection() {
    connection.end(function(err) {
        if (err) {
          return console.log('error:' + err.message);
        }
        console.log('Closed the database connection.');
      });
}


//App.get represents that this is a get request, the "/" is the path at which the api will respond with the response.send("hello").
app.get('/', (req, res) => {
    res.send("Hello");
})

//Get the busiest airports based on rank and year
app.get('/busiestAirports/rank/:rank/:year', (req, res) => {
    var rank = req.params.rank;
    var year = req.params.year;
    var sql = "SELECT * FROM busiest_airports WHERE rank = ? AND year = ?";
    //Checks if the parameters only have numbers
    if (/^\d+$/.test(rank) && /^\d+$/.test(year)) {
        if (connectToDB) {
            //Values automatically escaped
            connection.query(sql, [rank, year], function (err, result) {
                if (err) throw err;
                //Check if there were any results
                if (result < 1) {
                    res.status(404).send("No data found for these parameters.")
                } else {
                    res.send(result);
                }
            });
        }
    } else {
        res.send("Please only use digits in the query.");
    }

});

//Add a record to the busiest airport table
app.post('/busiestAirports/addEntry', (req, res) => {
    var sql = "INSERT INTO busiest_airports (rank, year, airport, code, location, country, total_passengers) VALUES (?,?,?,?,?,?,?)";
    if (req.get("Content-Type") != "application/json") {
        res.status(400).send("Please use Json")
    } else {
        try {
            var jsonInput = req.body;
            var result = validate(jsonInput, busiestAirportsSchema);
            if (result.valid) {
                if (connectToDB) {
                    var array = [jsonInput.rank, jsonInput.year, jsonInput.airport, jsonInput.code, jsonInput.location, jsonInput.country, jsonInput.total_passengers]
                    connection.query(sql, array, function (err, result) {
                        if (err) {
                            res.send(result);
                            endconnection()
                        } else {
                            res.send("Data has been inserted.")
                        }
                    });

                }
            } else {
                res.status(400).send(result)
            }
        } catch (err) {
            res.send(err.message)
        }
    }
})

//Update the rank of a single airport
app.put('/busiestAirports/updateSingleRank', (req, res) => {
    var sql = "UPDATE busiest_airports SET rank = ? WHERE airport = ? AND ID = ? AND total_passengers = ?";
    if (req.get("Content-Type") != "application/json") {
        res.status(400).send("Please use Json")
    } else {
        try {
            var jsonInput = req.body;
            var result = validate(jsonInput, busiestAirportsSchemaUpdate);
            if (result.valid) {
                if (connectToDB) {
                    var array = [jsonInput.rank, jsonInput.airport, jsonInput.ID ,jsonInput.total_passengers]
                    connection.query(sql, array, function (err, result) {
                        if (err) {
                            res.send(err.message)
                            endconnection()
                        } else {
                            if (result.affectedRows > 0) {
                                res.send("The row has been succesfully updated")
                            } else {
                                res.status(404).send("No entries were found with the parameters provided")
                            }
                        }
                    });

                }
            } else {
                res.status(400).send(result)
            }
        } catch (err) {
            res.send(err.message)
        }
    }
})

//Delete a record from the busiestAirports table
app.delete('/busiestAirports/deleteEntry', (req, res) => {
    var sql = "DELETE FROM busiest_airports WHERE ID = ? AND airport = ?";
    if (req.get("Content-Type") != "application/json") {
        res.status(400).send("Please use Json")
    } else {
        try {
            var jsonInput = req.body;
            var result = validate(jsonInput, busiestAirportsSchemaUpdate);
            if (result.valid) {
                if (connectToDB) {
                    var array = [jsonInput.rank, jsonInput.airport, jsonInput.ID ,jsonInput.total_passengers]
                    connection.query(sql, array, function (err, result) {
                        if (err) {
                            res.send(err.message)
                            endconnection()
                        } else {
                            if (result.affectedRows > 0) {
                                res.send("The entry has been succesfully deleted")
                            } else {
                                res.status(404).send("No entries were found with the parameters provided")
                            }
                        }
                    });

                }
            } else {
                res.status(400).send(result)
            }
        } catch (err) {
            res.send(err.message)
        }
    }
})

//Get the number of negative or positive reviews for an airline


const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Listening on port ${port}`))