

const importFields = async (sourceItem, fieldMapping, cache) => {
  const { SOURCE_IDENTIFIER } = strapi.plugins["import-relations"].config;

  const updatedItem = {importing: true};
  
  let mg_id
  for (const sourceField of Object.keys(fieldMapping)) {
    const { destination, collection, collectionCol } = fieldMapping[sourceField];
    const entryValue = sourceItem[sourceField]
    if(!entryValue){
      continue;
    }
    if (!destination || destination === "none" || !collection || collection === "none" || !collectionCol || collectionCol === "none" ) {
      if (destination === SOURCE_IDENTIFIER){
        mg_id = entryValue
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
  return {mg_id, updatedItem};
};
module.exports = {
  importFields,
};