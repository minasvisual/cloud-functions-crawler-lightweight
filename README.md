# Under construction - Not stable!

#### Based on repository: https://github.com/anishkny/puppeteer-on-cloud-functions

Google Cloud Function to scrape specified data

Node system to create dynamic and cronlable crawlers with business rules only.

Body crawlers:
- on POST body json ( Header Content-Type: application/json)
```
{ 
    "name": "example",
    "task": {
        "url": "https://ionicabizau.net", //( string or array of strings)
        "schema": {
            "title": ".header h1", //string selector that returns element textContent (see puppeteer docs)
            "avatar": {
                "selector": ".header img[src]", // advanced way
                "attr": "src"  // OPTIONAL | accept element attributes (see $eval puppeteer docs) ex: href|src|innerHTML
                "eq": 0 // OPTIONAL | element array index, in case of multiple elements selected
                "trim": true // OPTIONAL | clear data with trim function
            },
            "desc": { 
              "selector":".header h2",
              "attr": "innerHTML"
            },
            "menu":{
                "listItem": ".pages > li",
                "data": {
                   "name": "a"
                }
            }
        }
    }
}
```

Installation
```
npm install
```
- Test local your task running  ( configure example on server.js )
```
node server
```

#Logs 
GCP log is generated during processes

Additional packages
- lodash
- axios
- puppeteer-core
- chrome-aws-lambda

Based on this blog post: *[Introducing headless Chrome support in Cloud Functions and App Engine](https://cloud.google.com/blog/products/gcp/introducing-headless-chrome-support-in-cloud-functions-and-app-engine)*

## Deployment
```
npm run deploy
```