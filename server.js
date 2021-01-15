const scraper = require('./index')

var args = process.argv.slice(2);

const model = args[0];
const response  = { send: console.info, status: () => response }

const run = async () => {
    let data = await scraper.crawlersingle(
        { 
            body: { 
                "name": "example",
                "task": {
                    "url": "https://ionicabizau.net",  
                    "schema": {
                        "title": ".header h1", 
                        "avatar": {
                            "selector": ".header img[src]",  
                            "attr": "src",
                            "eq": 0,
                            "trim": true 
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
        },
        response
    )
    console.log(JSON.stringify(data))
}

(async function(){
    await run()

    process.exit(0)
})()