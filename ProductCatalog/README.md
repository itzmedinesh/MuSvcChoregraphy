# ProductCatalog
The project exposes REST APIs which internally choreographes between ProductSearchAndList, ProductImage and ProductReview services and produces a consolidated JSON response containing array of product details. Following are the two APIs exposed:


URL 1 : http://localhost:7000/api/product/catalog/series?listSize=10

Choreography of services happens in a serial fashion. Calls ProductSearchAndList service, iterates through the resulting product list items and calls ProductImage & ProductReview services one after the other. Captures results in each iteration and updates the response array with product details.


URL 2 : http://localhost:7000/api/product/catalog/parallel?listSize=10

Choreography of services happens in parallel. Calls ProductSearchAndList service, iterates through the resulting product list items and constructs asynchronous tasks to call ProductImage & ProductReview services parallely for each item . The asynchronous tasks constructed are then executed in parallel.

Query Parameter : "listSize" query parameter is used to specify the number of products that has to be displayed in the response. Should be non-negative and greater than 0. If the parameter is not passed, then all the products returned from ProductSearchAndList service is displayed.

## Usage

1. Navigate to project folder from Node.js command prompt.
2. Execute command "npm install"
3. Execute command "node app.js"

The node.js process will run on port 7000. 

Note: Fiddler proxy running on port 8888 is used to capture HTTP network call trace.

## Development Tools

Created with [Nodeclipse](https://github.com/Nodeclipse/nodeclipse-1)
 ([Eclipse Marketplace](http://marketplace.eclipse.org/content/nodeclipse), [site](http://www.nodeclipse.org))   

1. Nodeclipse IDE - free open-source project that grows with your contributions.

2. Node.js server version # 0.12.7 - Javascript execution environment

3. Express.js - Javascript based MVC framework for Node.js

4. OOJS - Object oriented JavaScripting is used to develop the choreography functions.
