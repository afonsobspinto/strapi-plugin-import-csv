const {ID_KEY} = require("./utils");

const importRelations = async (sourceItem, fieldMapping, cache) => {

  let uid
  const updatedItem = {};

  for (const sourceField of Object.keys(fieldMapping)) {
    const { destination, collection, collectionCol } = fieldMapping[sourceField];
    const entryValue = sourceItem[sourceField]
    if(!entryValue){
      continue;
    }
    if (!destination || destination === "none" || !collection || collection === "none" || !collectionCol || collectionCol === "none" ) {
      if (Object.keys(fieldMapping[sourceField]).includes(ID_KEY)){
        uid = entryValue
      }
      continue;
    }
    let relatedStrapi
    if (entryValue.includes(',')) {
      relatedStrapi = []
      const related = entryValue.split(',')
      for (const r of related){
        if (!(r in cache)){
          cache[r] = await strapi.query(collection).findOne({[collectionCol]:r})
        }
        relatedStrapi.push(cache[r])
      }
    }
    else{
      if (!(entryValue in cache)){
        cache[entryValue] = await strapi.query(collection).findOne({[collectionCol]:entryValue})
      }
      relatedStrapi = cache[entryValue]
    }
    updatedItem[destination] = relatedStrapi;
  }
  return {uid, updatedItem};
};

const importFields = (sourceItem, fieldMapping) => {
  const importedItem = {};
  for (const sourceField of Object.keys(fieldMapping)) {
    const { destination } = fieldMapping[sourceField];
    if (!destination || destination === "none") {
      continue;
    }
    importedItem[destination] = sourceItem[sourceField];
  }
  return importedItem;
};

module.exports = {
  importFields,
  importRelations
};
