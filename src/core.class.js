const { has, get } = require('lodash')
const LogClass = require('./logger.class')
const Logger = LogClass()

module.exports = function(){
  let service = {
    validateModel: (model) => has(model, 'name') && has(model, 'task') && (typeof model.task == 'object'),

    getObjectSelector: async (page, selector) => {
      return await page.$eval(selector.selector, (elem, selector) => {
        let data = ''
        if (!elem)
          return data // if not exists
        if (Array.isArray(elem) && elem.length == 0)
          return [] // if array and doesnt exists

        if (Array.isArray(elem)) {
          if (elem.length > 0 && selector.eq)
            elem = elem[selector.eq]
          else
            elem = elem[0] || {} // if array and exists
        }

        if (selector.attr)
          data = elem[selector.attr]
        else if (selector.how)
          data = elem[selector.how]
        else
          data = elem.innerHTML

        if (selector.trim)
          data = data && data.trim()

        return data
      }, selector)
    },
    
    getArraySelector: async (page, selector) => {
      return await page.$$eval(selector.listItem, (elem, selector) => {
          let data = []  
          
          if( !elem ) return ['elem nao existe'] // if not exists
          if( Array.isArray(elem) && elem.length == 0 )  return ['vazio'] // if array and doesnt exists
    
          data = elem.map((item) => {
            let temp = {}
            for(let subSelName in selector.data){
              let subselector = selector.data[subSelName]
              if( !item ) return item.textContent;
              
              if( Array.isArray(item) ){
                if( item.length > 0 && subselector.eq ) item = item[subselector.eq]  
                else item = item[0] || {} // if array and exists
              }

              if( typeof subselector == 'string' ){
                temp[subSelName] = item && item.querySelector(subselector).textContent
              }else if( subselector.selector && subselector.attr ){
                temp[subSelName] = item && item.querySelector(subselector.selector)[subselector.attr]
              }else if( subselector.selector && subselector.how ){
                let action =  item && item.querySelector(subselector.selector)
                temp[subSelName] = ( action[subselector.how] ? action[subselector.how]() : action.innerHTML )
              }else{
                temp[subSelName] = item.textContent
              }
              if( subselector.trim )
                temp[subSelName] = temp[subSelName] && temp[subSelName].trim()
    
              if( subselector.convert )
                temp[subSelName] = subselector.convert(temp[subSelName])
            }
            return temp
          })
          
          return data
      }, selector)
    },
    
    scrapeData: async ({ model, task, page, taskName }) => {
      let data = []
      let source = {}

      if(task.schema && task.url){
        if( !Array.isArray(task.url) ) task.url = [task.url]
      
        if( task.url.length == 0 ){
          Logger.error('Task URL EMPTY '+ task)
          return data
        } 

        for( let url of task.url ){
            Logger.debug('page goto', url)
            await page.goto(url, {waitUntil: 'networkidle0', timeout: 0});

            for( let selectorName in task.schema ){
              try{
                Logger.debug('run selector '+selectorName)
                let selector = task.schema[selectorName]
        
                if( typeof selector == 'string' ){
                  source[selectorName] = await page.$eval(selector, el => el.textContent )
                }
                else if( typeof selector == 'object' && selector.selector && !selector.listItem ){
                  source[selectorName] = await service.getObjectSelector(page, selector)
                }
                else if( typeof selector == 'object' && selector.listItem && selector.data ){
                  source[selectorName] = await service.getArraySelector(page, selector)
                }
                else{
                  source[selectorName] = false
                }
        
                Logger.debug('runned selector '+selectorName, source[selectorName])
                
              }catch(e){
                Logger.error('Selector error', e.message)
                source[selectorName] = null
              }  
            }
          
            data.push(source);
            source = {}
        }
      }else{
        Logger.debug('return no selector '+ task)
      }
    
      return  data
    } 
  }//end return

  return service
}