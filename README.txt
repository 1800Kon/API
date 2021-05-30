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