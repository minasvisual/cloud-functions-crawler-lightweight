const scraper = require('./index')

var args = process.argv.slice(2);

const model = args[0];
const response  = { send: console.info, status: () => response }

const run = async () => {
    await scraper.crawlersingle(
        { body: { 
                "name": "example",
                "task": {
                    "url": "https://ionicabizau.net",
                    "schema": {
                        "title": ".header h1",
                        "avatar": {
                            "selector": ".header img[src]",
                            "attr": "src"
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
}

run()

//process.exit()