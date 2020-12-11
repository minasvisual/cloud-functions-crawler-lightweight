const chromium = require('chrome-aws-lambda');
const CoreClass = require('./src/core.class')
const LogClass = require('./src/logger.class')

let page;
var buffer = {}
const Logger = LogClass()

async function getBrowserPage() {
  // Launch headless Chrome. Turn off sandbox so Chrome can run under root.
  let args = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-infobars',
    '--window-position=0,0',
    '--ignore-certifcate-errors',
    '--ignore-certifcate-errors-spki-list',
    '--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"'
  ]

  const browser = await chromium.puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
    ignoreHTTPSErrors: true,
  });

  return browser.newPage();
}

exports.crawlersingle = async (req, res) => {
  const model = req.body;
  const Engine = CoreClass()
  
  if ( !model || !Engine.validateModel(model) )  return res.send('404, Please provide valid model', model); 

  try{
      Logger.debug('Initializing model '+model.name)
      // starts browser
      if (!page) page = await getBrowserPage();
      
      await page.setDefaultNavigationTimeout(0); 
      //expose functions to evaluate
      //await page.exposeFunction('Logger', Logger.log); 
      // bind console log of evaluate
      page.on('console', msg => Logger.log('eval log', msg.text()));

      // start process tasks list | for tasks runtime updates, we use "for" to count new tasks
      let taskName = model.name
      let task = model.task
      buffer[taskName] = {}

      Logger.debug('initialized task ' + taskName)

      buffer[taskName] = await Engine.scrapeData({ model, task, page, taskName })
      
      Logger.debug('finished task '+taskName)

      await page.close();

      res.send(buffer);

      buffer = {}
      return true;
  }catch(err){
    Logger.error(err)

    return res.status(403).send(err.message)
  }
};
