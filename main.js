var express = require('express')
var mysql = require('mysql');
var validator = require('validator')
var app = express();
var validate = require('jsonschema').validate;
var libxml = require("libxmljs2");
var Chart = require('chart.js');
const ChartJsImage = require('chartjs-to-image');
app.use(express.json());

//Schemas
const busiestAirportsSchema = require('./jsonValidations/busiest_airports_schema.json');
const busiestAirportsSchemaUpdate = require('./jsonValidations/busiest_airports_update_schema.json');
const busiestAirportsSchemaDelete = require('./jsonValidations/busiest_airport_schema_delete.json');

const delayGetSchema = require('./jsonValidations/delay_get_schema.json');
const delayPostSchema = require('./jsonValidations/delay_post_schema.json');
const delayUpdateSchema = require('./jsonValidations/delay_update_schema.json');
const delayDeleteSchema = require('./jsonValidations/delay_delete_schema.json');

const twitterSchema = require('./jsonValidations/twitter_schema.json');
const tweetGetSchema = require('./jsonValidations/twitter_get_schema.json');
const tweetDeleteSchema = require('./jsonValidations/twitter_delete_schema.json');
const tweetUpdateSchema = require('./jsonValidations/twitter_update_schema.json')


var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "api_database_dp"
});

//Function to connect to the database
function connectToDB() {
    connection.connect(function(err) {
        if (err) {
            return console.error(err.message);
        }
        console.log("Connected to database.");
    });
}

//Main page
app.get('/', (req, res) => {
    res.send("This is the main page");
})

// READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ
// READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ 
// READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ 
// READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ 
// READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ READ 

//Get the busiest airports graph based on rank and year
app.get('/busiestAirports/getRankOfYearGraph/:rank/:year', (req, res) => {
    var rank = req.params.rank;
    var year = req.params.year;
    var sql = "SELECT rank, year, airport, code, location, country, total_passengers FROM busiest_airports WHERE rank = ? AND year = ?";
    //Checks if the parameters only have numbers
    if (/^\d+$/.test(rank) && /^\d+$/.test(year)) {
        if (connectToDB) {
            //Values automatically escaped
            connection.query(sql, [rank, year], function(err, result) {
                if (err) throw err;
                //Check if there were any results
                if (result < 1) {
                    res.status(404).send("No data found for these parameters.")
                } else {
                    var validated = validate(result, busiestAirportsSchema);
                    if (validated) {
                        var labelsToUse = [];
                        var dataToUse = [];
                        result.forEach(response => {
                            labelsToUse.push(response.airport);
                            dataToUse.push(response.total_passengers);
                        });
                        async function chartData() {
                            const myChart = new ChartJsImage();
                            myChart.setConfig({
                                type: 'bar',
                                data: { labels: labelsToUse, datasets: [{ label: 'Airport and number of passengers', data: dataToUse, fill: false, backgroundColor: 'rgba(255, 99, 132, 0.2)', borderColor: 'rgba(255, 50, 132, 0.2)', borderWidth: 1 }] },
                            });
                            const dataUrl = await myChart.getUrl()
                            res.send("<img src=" + dataUrl + ">");
                            //res.send(result);
                        }
                        chartData();
                    } else {
                        res.status(404).send("The data found was not valid");
                    }
                }
            });
        }
    } else {
        res.send("Please only use digits in the query.");
    }

});

//Get the busiest airports data based on rank and year
app.get('/busiestAirports/getRankOfYear/:rank/:year', (req, res) => {
    var rank = req.params.rank;
    var year = req.params.year;
    var sql = "SELECT rank, year, airport, code, location, country, total_passengers FROM busiest_airports WHERE rank = ? AND year = ?";
    //Checks if the parameters only have numbers
    if (/^\d+$/.test(rank) && /^\d+$/.test(year)) {
        if (connectToDB) {
            //Values automatically escaped
            connection.query(sql, [rank, year], function(err, result) {
                if (err) throw err;
                //Check if there were any results
                if (result < 1) {
                    res.status(404).send("No data found for these parameters.")
                } else {
                    var validated = validate(result, busiestAirportsSchema);
                    if (validated) {
                        res.send(result);
                    } else {
                        res.status(404).send("The data found was not valid");
                    }
                }
            });
        }
    } else {
        res.send("Please only use digits in the query.");
    }
});

//Get graph for airport aircraft delay depending on year and month
app.get('/flightDelays/delaysFromYearMonthGraph/:year/:month', (req, res) => {
    var year = req.params.year;
    var month = req.params.month;
    var sql = "SELECT year, month, carrier, carrier_name, airport, airport_name, arr_flights, arr_del15, carrier_ct, weather_ct, nas_ct, security_ct, late_aircraft_ct, arr_cancelled, arr_diverted, arr_delay FROM airline_delay_causes WHERE year = ? AND month = ?";
    //Checks if the parameters only have numbers
    if (/^\d+$/.test(year) && /^\d+$/.test(month)) {
        if (connectToDB) {
            //Values automatically escaped
            connection.query(sql, [year, month], function(err, result) {
                if (err) throw err;
                //Check if there were any results
                if (result < 1) {
                    res.status(404).send("No data found for these parameters.")
                } else {
                    var validated = validate(result, delayGetSchema);
                    if (validated) {
                        var labelsToUse = [];
                        var dataToUse = [];
                        var breakout = false;
                        result.forEach(response => {
                            if (!breakout) {
                                labelsToUse.push(response.airport_name);
                                dataToUse.push(response.arr_del15);
                            }
                            if (dataToUse.length > 20) {
                                breakout = true;
                            }
                        });
                        async function chartData() {
                            const myChart = new ChartJsImage();
                            myChart.setConfig({
                                type: 'bar',
                                data: { labels: labelsToUse, datasets: [{ label: 'Total of arriving flight with delays (First 20)', data: dataToUse, fill: false, backgroundColor: 'rgba(255, 99, 132, 0.2)', borderColor: 'rgba(255, 50, 132, 0.2)', borderWidth: 1 }] },
                            });
                            const dataUrl = await myChart.getShortUrl()
                            res.send("<img src=" + dataUrl + ">");
                            //res.send(result);
                        }
                        chartData();
                    } else {
                        res.status(404).send("The data found was not valid");
                    }
                }
            });
        }
    } else {
        res.send("Please only use digits in the query.");
    }

});

//Get data for airport aircraft delay depending on year and month
app.get('/flightDelays/delaysFromYearMonth/:year/:month', (req, res) => {
    var year = req.params.year;
    var month = req.params.month;
    var sql = "SELECT year, month, carrier, carrier_name, airport, airport_name, arr_flights, arr_del15, carrier_ct, weather_ct, nas_ct, security_ct, late_aircraft_ct, arr_cancelled, arr_diverted, arr_delay FROM airline_delay_causes WHERE year = ? AND month = ?";
    //Checks if the parameters only have numbers
    if (/^\d+$/.test(year) && /^\d+$/.test(month)) {
        if (connectToDB) {
            //Values automatically escaped
            connection.query(sql, [year, month], function(err, result) {
                if (err) throw err;
                //Check if there were any results
                if (result < 1) {
                    res.status(404).send("No data found for these parameters.")
                } else {
                    var validated = validate(result, delayGetSchema);
                    if (validated) {
                        res.send(result);
                    } else {
                        res.status(404).send("The data found was not valid");
                    }
                }
            });
        }
    } else {
        res.send("Please only use digits in the query.");
    }

});

//Get all positive or negative tweets chart towards an airline
app.get('/tweets/getPositiveNegativeTweetsAirlineGraph/:sentiment/:airline', (req, res) => {
    var sentiment = req.params.sentiment;
    var airline = req.params.airline;
    var sql = "SELECT COUNT(text) as totalCount, airline FROM tweets WHERE airline_sentiment = ? AND airline LIKE ?";
    //Checks if the parameters only have numbers
    if (connectToDB) {
        //Values automatically escaped
        connection.query(sql, [sentiment, airline], function(err, result) {
            if (err) throw err;
            //Check if there were any results
            if (result < 1) {
                res.status(404).send("No data found for these parameters.")
            } else {
                var validated = validate(result, tweetGetSchema)
                if (validated) {
                    var labelsToUse = [];
                    var dataToUse = [];
                    var breakout = false;
                    result.forEach(response => {
                        if (!breakout) {
                            labelsToUse.push(response.airline);
                            dataToUse.push(response.totalCount);
                        }
                        if (dataToUse.length > 20) {
                            breakout = true;
                        }
                    });
                    async function chartData() {
                        const myChart = new ChartJsImage();
                        myChart.setConfig({
                            type: 'bar',
                            data: { labels: labelsToUse, datasets: [{ label: 'Total number of tweets toward airline with specified sentiment', data: dataToUse, fill: false, backgroundColor: 'rgba(255, 99, 132, 0.2)', borderColor: 'rgba(255, 50, 132, 0.2)', borderWidth: 1 }] },
                        });
                        const dataUrl = await myChart.getShortUrl()
                        res.send("<img src=" + dataUrl + ">");
                    }
                    chartData();
                } else {
                    res.status(404).send("The data found was not valid");
                }
            }
        });
    }
});

//Get all positive or negative tweets towards an airline
app.get('/tweets/getPositiveNegativeTweetsAirline/:sentiment/:airline', (req, res) => {
    var sentiment = req.params.sentiment;
    var airline = req.params.airline;
    var sql = "SELECT text FROM tweets WHERE airline_sentiment = ? AND airline = ?";
    //Checks if the parameters only have numbers
    if (connectToDB) {
        //Values automatically escaped
        connection.query(sql, [sentiment, airline], function(err, result) {
            if (err) throw err;
            //Check if there were any results
            if (result < 1) {
                res.status(404).send("No data found for these parameters.")
            } else {
                var validated = validate(result, tweetGetSchema)
                if (validated) {
                    res.send(result);
                } else {
                    res.status(404).send("The data found was not valid");
                }
            }
        });
    }
});


// CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE 
// CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE 
// CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE 
// CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE 
// CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE CREATE 

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
                    connection.query(sql, array, function(err, result) {
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

//Add a record to the tweets table
app.post('/tweets/addEntry', (req, res) => {
    //Connection
    var connection = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "api_database_dp"
    });
    var sql = "INSERT INTO tweets (tweet_id, airline_sentiment, negativereason, airline, name, retweet_count, text) VALUES (?,?,?,?,?,?,?)";
    if (req.get("Content-Type") != "application/json") {
        res.status(400).send("Please use Json")
    } else {
        try {
            //Save the input to a variable and then validate it
            var jsonInput = req.body;
            var result = validate(jsonInput, twitterSchema);
            if (result.valid) {
                if (connectToDB) {
                    //Save all the variables to an array so they can be inserted into the query string safely
                    var array = [jsonInput.tweet_id, jsonInput.airline_sentiment, jsonInput.negativereason, jsonInput.airline, jsonInput.name, jsonInput.retweet_count, jsonInput.text];
                    connection.query(sql, array, function(err, result) {
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
});

//Add a record to the airline delays table
app.post('/flightDelays/addEntry', (req, res) => {
    //Connection
    var connection = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "api_database_dp"
    });
    var sql = "INSERT INTO airline_delay_causes (year, month, carrier, carrier_name, airport, airport_name, arr_flights, arr_del15, carrier_ct, weather_ct, nas_ct, security_ct, late_aircraft_ct, arr_cancelled, arr_diverted, arr_delay, carrier_delay, weather_delay, nas_delay, security_delay, late_aircraft_delay) VALUES( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    if (req.get("Content-Type") != "application/json") {
        res.status(400).send("Please use Json")
    } else {
        try {
            //Save the input to a variable and then validate it
            var jsonInput = req.body;
            var result = validate(jsonInput, delayPostSchema);
            if (result.valid) {
                if (connectToDB) {
                    //Save all the variables to an array so they can be inserted into the query string safely
                    var array = [jsonInput.year, jsonInput.month, jsonInput.carrier, jsonInput.carrier_name, jsonInput.airport, jsonInput.airport_name, jsonInput.arr_flights, jsonInput.arr_del15, jsonInput.carrier_ct, jsonInput.weather_ct, jsonInput.nas_ct, jsonInput.security_ct, jsonInput.late_aircraft_ct, jsonInput.arr_cancelled, jsonInput.arr_diverted, jsonInput.arr_delay, jsonInput.carrier_delay, jsonInput.weather_delay, jsonInput.nas_delay, jsonInput.security_delay, jsonInput.late_aircraft_delay];
                    connection.query(sql, array, function(err, result) {
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
});

// UPDATE UPDATE UPDATE UPDATE UPDATE UPDATE UPDATE UPDATE UPDATE UPDATE UPDATE UPDATE UPDATE UPDATE UPDATE UPDATE UPDATE
// UPDATE UPDATE UPDATE UPDATE UPDATE UPDATE UPDATE UPDATE UPDATE UPDATE UPDATE UPDATE UPDATE UPDATE UPDATE UPDATE UPDATE
// UPDATE UPDATE UPDATE UPDATE UPDATE UPDATE UPDATE UPDATE UPDATE UPDATE UPDATE UPDATE UPDATE UPDATE UPDATE UPDATE UPDATE
// UPDATE UPDATE UPDATE UPDATE UPDATE UPDATE UPDATE UPDATE UPDATE UPDATE UPDATE UPDATE UPDATE UPDATE UPDATE UPDATE UPDATE
// UPDATE UPDATE UPDATE UPDATE UPDATE UPDATE UPDATE UPDATE UPDATE UPDATE UPDATE UPDATE UPDATE UPDATE UPDATE UPDATE UPDATE

//Update the rank of a single airport
app.put('/busiestAirports/updateRank', (req, res) => {
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
                    var array = [jsonInput.rank, jsonInput.airport, jsonInput.ID, jsonInput.total_passengers]
                    connection.query(sql, array, function(err, result) {
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

// Update airline delay cause
app.put('/flightDelays/updateData', (req, res) => {
    //Connection
    var connection = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "api_database_dp"
    });
    var sql = "UPDATE airline_delay_causes SET arr_flights = ?, arr_del15 = ?, carrier_ct = ?, weather_ct = ?, nas_ct = ?, security_ct = ?, late_aircraft_ct = ?, arr_cancelled = ?, arr_diverted = ?, arr_delay = ?, carrier_delay = ?, weather_delay = ?, nas_delay = ?, security_delay = ?, late_aircraft_delay = ? WHERE year = ? AND month = ? AND carrier = ? AND airport = ?"
    if (req.get("Content-Type") != "application/json") {
        res.status(400).send("Please use Json")
    } else {
        try {
            var jsonInput = req.body;
            var result = validate(jsonInput, delayUpdateSchema);
            if (result.valid) {
                if (connectToDB) {
                    var array = [jsonInput.arr_flights, jsonInput.arr_del15, jsonInput.carrier_ct, jsonInput.weather_ct, jsonInput.nas_ct, jsonInput.security_ct, jsonInput.late_aircraft_ct, jsonInput.arr_cancelled, jsonInput.arr_diverted, jsonInput.arr_delay, jsonInput.carrier_delay, jsonInput.weather_delay, jsonInput.nas_delay, jsonInput.security_delay, jsonInput.late_aircraft_delay, jsonInput.year, jsonInput.month, jsonInput.carrier, jsonInput.airport];
                    connection.query(sql, array, function(err, result) {
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

// Update tweet
app.put('/tweets/updateTweetText', (req, res) => {
    //Connection
    var connection = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "api_database_dp"
    });
    var sql = "UPDATE tweets SET text = ? WHERE name = ? AND airline = ?"
    if (req.get("Content-Type") != "application/json") {
        res.status(400).send("Please use Json")
    } else {
        try {
            var jsonInput = req.body;
            var result = validate(jsonInput, tweetUpdateSchema);
            if (result.valid) {
                if (connectToDB) {
                    var array = [jsonInput.text, jsonInput.name, jsoninput.airline];
                    connection.query(sql, array, function(err, result) {
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
});

// DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE 
// DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE 
// DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE 
// DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE 
// DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE DELETE 

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
                    var array = [jsonInput.ID, jsonInput.airport]
                    connection.query(sql, array, function(err, result) {
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
});

// Delete late flight data
app.delete('/flightDelays/deleteEntry', (req, res) => {
    var connection = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "api_database_dp"
    });
    var sql = "DELETE FROM airline_delay_causes WHERE year = ? AND month = ? AND carrier = ? AND airport = ? AND arr_flights = ?";
    if (req.get("Content-Type") != "application/json") {
        res.status(400).send("Please use Json")
    } else {
        try {
            var jsonInput = req.body;
            var result = validate(jsonInput, delayDeleteSchema);
            if (result.valid) {
                if (connectToDB) {
                    var array = [jsonInput.year, jsonInput.month, jsonInput.carrier, jsonInput.airport, jsonInput.arr_flights];
                    connection.query(sql, array, function(err, result) {
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
});

// Delete tweet
app.delete('/tweets/deleteEntry', (req, res) => {
    var connection = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "api_database_dp"
    });
    var sql = "DELETE FROM tweets WHERE airline = ? AND name = ?";
    if (req.get("Content-Type") != "application/json") {
        res.status(400).send("Please use Json")
    } else {
        try {
            var jsonInput = req.body;
            var result = validate(jsonInput, tweetDeleteSchema);
            if (result.valid) {
                if (connectToDB) {
                    var array = [jsonInput.airline, jsonInput.name];
                    connection.query(sql, array, function(err, result) {
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