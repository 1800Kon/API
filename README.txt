On it's current state (15/1/2021) the API can:
    - Perform all CRUD operations on the busiest_airports database hosted in localhost
    - Validate JSON user input against schemas in the API level
    - Protect against SQL injections in the database

The paths are as follows:

http://127.0.0.1:3000/busiestAirports/getRankOfYear         (GET)
    Accepts: "rank", "year" in JSON format
    Returns: The entries which have the rank and year specified in the request body

http://127.0.0.1:3000/busiestAirports/addEntry              (POST)
    Accepts: "rank", "year", "airport", "code", "location", "country", "total_passengers" in JSON format
    Returns: If the operation succeeded or not

http://127.0.0.1:3000/busiestAirports/updateSingleRank      (PUT)
    Accepts: "rank", "airport" in JSON format
    Returns: If the operation succeeded or not

http://127.0.0.1:3000/busiestAirports/deleteEntry           (DELETE)
    Accepts: "ID", "airport" in JSON format
    Returns: If the operation succeeded or not