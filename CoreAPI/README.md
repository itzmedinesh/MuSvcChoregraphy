# 1. JDK 8
Install JDK 8 (If not already present) and point your JAVA_HOME and PATH environment variables to <JDK 8 Install Path> and <JDK 8 Install Path/bin>

# 2a. Start Listing Service
Command to Run the Service –
java -jar listing-1.0-SNAPSHOT-jar-with-dependencies.jar

# 2b. Start Search Service
Command to Run the Service -
java -jar search-1.0-SNAPSHOT-jar-with-dependencies.jar

# 3. Test the Services
You should make the Search Service call first and you will get the products with their seller id's.
Then make the call to Listing Service by passing sellerId and productId (from search response) to fetch the corresponding seller review and product Image separately (URLs provided in List Service list)
All services are mocked and return random results injected with a variable delay.

# Search Service
http://localhost:4567/search/bykeyword?searchTerm=random&as=json

# Listing Service 
http://localhost:4568/listing/images?productId=12342
http://localhost:4568/listing/reviews/seller?sellerid=1234


