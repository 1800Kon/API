var express = require('express')
var mysql = require('mysql');
var validator = require('validator')
var app = express();
var validate = require('jsonschema').validate;
var libxml = require("libxmljs2");
app.use(express.json());

//Constants
const busiestAirportsSchema = require('./busiest_airports_schema.json')
const busiestAirportsSchemaGet = require('./busiest_airport_schema_get.json')
const busiestAirportsSchemaUpdate = require('./busiest_airports_update_schema.json')
const busiestAirportsSchemaDelete = require('./busiest_airport_schema_delete.json')

//Database connection, could use connection pooling to fix the issue with having to reinstantiate the connection
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

//Main page
app.get('/', (req, res) => {
    res.send("This is the main page where I'll put an index");
})

//Get the busiest airports based on rank and year
app.get('/busiestAirports/getRankOfYear', (req, res) => {
    //Create the connection
    var connection = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "api_database_dp"
    });
    //Query to be executed
    var sql = "SELECT * FROM busiest_airports WHERE rank = ? AND year = ?";
    var jsonInput = req.body;
    //Validates the results against the schema
    var result = validate(jsonInput, busiestAirportsSchemaGet);
    //Checks if the postman input is of type json
    if (req.get("Content-Type") != "application/json") {
        res.status(400).send("Please use Json")
    } else {
        //Checks if the results are valid or not
        if (result.valid) {
            //Connects to the database
            if (connectToDB) {
                //Values automatically escaped
                connection.query(sql, [jsonInput.rank, jsonInput.year], function (err, result) {
                    if (err) {
                        res.send(err)
                    }
                    //Check if there were any results
                    if (result < 1) {
                        res.status(404).send("No data found for these parameters.")
                    } else {
                        //Send the results
                        res.send(result);
                    }
                });
                //End the connection after the transaction is complete
                connection.end();
            } else {
                console.log("Error connecting to the database.")
            }
        } else {
            res.status(400).send(result);
        }
    }
});

//Add a record to the busiest airport table
app.post('/busiestAirports/addEntry', (req, res) => {
    //Connection
    var connection = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "api_database_dp"
    });
    var sql = "INSERT INTO busiest_airports (rank, year, airport, code, location, country, total_passengers) VALUES (?,?,?,?,?,?,?)";
    if (req.get("Content-Type") != "application/json") {
        res.status(400).send("Please use Json")
    } else {
        try {
            //Save the input to a variable and then validate it
            var jsonInput = req.body;
            var result = validate(jsonInput, busiestAirportsSchema);
            if (result.valid) {
                if (connectToDB) {
                    //Save all the variables to an array so they can be inserted into the query string safely
                    var array = [jsonInput.rank, jsonInput.year, jsonInput.airport, jsonInput.code, jsonInput.location, jsonInput.country, jsonInput.total_passengers]
                    connection.query(sql, array, function (err, result) {
                        if (err) {
                            res.send(result);
                            connection.end();
                        } else {
                            res.send("Data has been inserted.")
                            connection.end();
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
    //Connection
    var connection = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "api_database_dp"
    });
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
                            connection.end();
                        } else {
                            if (result.affectedRows > 0) {
                                res.send("The row has been succesfully updated")
                                connection.end();
                            } else {
                                res.status(404).send("No entries were found with the parameters provided")
                                connection.end();
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
    var connection = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "api_database_dp"
    });
    var sql = "DELETE FROM busiest_airports WHERE ID = ? AND airport = ?";
    if (req.get("Content-Type") != "application/json") {
        res.status(400).send("Please use Json")
    } else {
        try {
            var jsonInput = req.body;
            var result = validate(jsonInput, busiestAirportsSchemaDelete);
            if (result.valid) {
                if (connectToDB) {
                    var array = [jsonInput.ID ,jsonInput.airport]
                    connection.query(sql, array, function (err, result) {
                        if (err) {
                            res.send(err.message)
                            connection.end();
                        } else {
                            if (result.affectedRows > 0) {
                                res.send("The entry has been succesfully deleted")
                                connection.end();
                            } else {
                                res.status(404).send("No entries were found with the parameters provided")
                                connection.end();
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


//Dinamically change the port in a working environment
const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Listening on port ${port}`))