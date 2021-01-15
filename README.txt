On it's current state (15/1/2021) the API can:
    - Perform all CRUD operations on the busiest_airports database hosted in localhost
    - Validate JSON user input against schemas in the API level
    - Protect against SQL injections in the database

Things that still have to be done:
    - Make the CRUD operation paths for the rest of the databases
    - Make a query that can get information from different databases
    - Accept API request in XML and validate them
    - Create the website for the application
    - Connect website fields to API for input
    - Visualize data
I really only need like 3 days to finish this lol, went from python with flask, to php, to NodeJs, I'll gladly do the resit, but in the meantime this is what I have

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

How to use:
    - Install some local server (xampp)
    - Import the database located in the DatabaseFile folder in the root of this project
    - Install Postman
    - Start the API
    - Use Postman to send the request call to the API trough the paths specified above in this document