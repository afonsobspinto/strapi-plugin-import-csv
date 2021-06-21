'use strict';

/**
 * import-relations.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */

const { resolveDataFromRequest, getItemsFromData } = require("./utils/utils");
const analyzer = require("./utils/analyzer");
const _ = require("lodash");
const {importFields} = require("./utils/importFields");


const merge = (current, toAdd) => {
  if (current == null){
    return toAdd
  }
  for(const key in current){
    if(key in toAdd){
      if(Array.isArray(current[key])){
        current[key].push(toAdd[key])
      }
      else{
        current[key] = [current[key], toAdd[key]]
      }
    }
    else{
      current[key] = toAdd[key]
    }
  }
  return current
}

const getItemsMap = async (items, fieldMapping) => {
  const cache = {}
  const map = {}
  for(const item of items){
    const {mg_id, updatedItem} = await importFields(
      item,
      fieldMapping,
      cache
    );
    map[mg_id] = merge(mg_id in map? map[mg_id]: null, updatedItem)
  }
  return map
}

module.exports = {
  preAnalyzeImportFile: async ctx => {
    const {dataType, body, options} = await resolveDataFromRequest(ctx);
    const {sourceType, items} = await getItemsFromData({
      dataType,
      body,
      options
    });
    const analysis = analyzer.analyze(sourceType, items);
    return {sourceType, ...analysis};
  },
  importItems: (importConfig, ctx) =>
    new Promise(async (resolve, reject) => {
      const { SOURCE_IDENTIFIER } = strapi.plugins["import-relations"].config;
      const { dataType, body } = await resolveDataFromRequest(ctx);
      try {
        const { items } = await getItemsFromData({
          dataType,
          body,
          options: importConfig.options
        });

        const itemsMap = await getItemsMap(items, importConfig.fieldMapping)
        for(const item in itemsMap){
          try {
            await strapi.services[importConfig.contentType]
              .update({[SOURCE_IDENTIFIER]: item}, itemsMap[item]);
          }
          catch (error){
            console.error(item)
          }

        }
        console.log(Date().toLocaleString())
        console.log("Import Completed")

      } catch (error) {
        reject(error);
      }
      resolve({
        status: "import started",
        importConfigId: importConfig.id
      });
    }),
};
