'use strict';

/**
 * import-csv.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */

const {resolveDataFromRequest, getItemsFromData, IMPORT_ACTION} = require("./utils/utils");
const analyzer = require("./utils/analyzer");
const _ = require("lodash");
const {ID_KEY} = require("./utils/utils");
const {importRelations, importFields} = require("./utils/importDataAux");

const merge = (current, toAdd) => {
  if (current == null) {
    return toAdd
  }
  for (const key in current) {
    if (key in toAdd) {
      if (Array.isArray(current[key])) {
        current[key].push(toAdd[key])
      } else {
        current[key] = [current[key], toAdd[key]]
      }
    } else {
      current[key] = toAdd[key]
    }
  }
  return current
}

const getItemsMap = async (items, fieldMapping) => {
  const cache = {}
  const map = {}
  for (const item of items) {
    const {uid, updatedItem} = await importRelations(
      item,
      fieldMapping,
      cache
    );
    map[uid] = merge(uid in map ? map[uid] : null, updatedItem)
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
  importItems: (ctx) =>
    new Promise(async (resolve, reject) => {
      const {options, fieldMapping, contentType, importState} = ctx.request.body
      const {dataType, body} = await resolveDataFromRequest(ctx);

      async function addRelations(items) {
        const updateOn = Object.keys(fieldMapping).find(key => fieldMapping[key][ID_KEY])
        const itemsMap = await getItemsMap(items, fieldMapping)
        for (const item in itemsMap) {
          try{
            await strapi.services[contentType].update({[updateOn]: item}, itemsMap[item]);
          }catch (exception){
            console.error(exception)
          }
        }
      }

      async function createEntities(items) {
        for (const item of items) {
          const entity = await importFields(item, fieldMapping);
          try{
            await strapi.services[contentType].create(entity);
          }catch (exception){
            console.error(exception)
          }
        }
      }

      try {
        const {items} = await getItemsFromData({
          dataType,
          body,
          options
        });

        if (importState === IMPORT_ACTION.relations) {
          await addRelations(items);
        } else {
          await createEntities(items)
        }
        resolve({
          status: 200,
          payload: {}
        })

      } catch (error) {
        reject({
          status: 500,
          payload: error
        });
      }
    }),
};
