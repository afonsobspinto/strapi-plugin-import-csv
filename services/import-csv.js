'use strict';

/**
 * import-csv.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */

const {resolveDataFromRequest, getItemsFromData, IMPORT_ACTION} = require("./utils/utils");
const analyzer = require("./utils/analyzer");
const _ = require("lodash");
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
    const {mg_id, updatedItem} = await importRelations(
      item,
      fieldMapping,
      cache
    );
    map[mg_id] = merge(mg_id in map ? map[mg_id] : null, updatedItem)
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
      const {SOURCE_IDENTIFIER} = strapi.plugins["import-csv"].config;
      const {options, fieldMapping, contentType, importState} = ctx.request.body
      const {dataType, body} = await resolveDataFromRequest(ctx);

      async function addRelations(items) {
        const itemsMap = await getItemsMap(items, fieldMapping)
        for (const item in itemsMap) {
          try {
            await strapi.services[contentType].update({[SOURCE_IDENTIFIER]: item}, itemsMap[item]);
          } catch (error) {
            console.error(item)
          }
        }
      }

      async function createEntities(items) {
        const entities = items.map(item => importFields(item, fieldMapping))
        for (const entity of entities) {
          try {
            await strapi.services[contentType].create(entity);
          } catch (error) {
            console.error(entity)
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
        }else{
          await createEntities(items)
        }

        resolve({
          status: "Import Completed Successfully",
        })

      } catch (error) {
        reject(error);
      }
;
    }),
};
