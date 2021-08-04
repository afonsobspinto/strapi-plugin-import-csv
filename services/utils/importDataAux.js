const {getMediaUrlsFromFieldData} = require("./fieldUtils");
const {ID_KEY} = require("./utils");
const request = require("request");
const fileFromBuffer = require("./fileFromBuffer");
const _ = require("lodash");

const fetchFiles = url =>
  new Promise((resolve, reject) => {
    request({url, method: "GET", encoding: null}, async (err, res, body) => {
      if (err) {
        reject(err);
      }
      const mimeType = Object.keys(res.headers).includes("content-type") ? res.headers["content-type"].split(";").shift() : "application/octet-stream"
      const parsed = new URL(url);
      const extension = parsed.pathname
        .split(".")
        .pop()
        .toLowerCase();
      resolve(fileFromBuffer(mimeType, extension, body));
    });
  });

const storeFiles = async file => {
  return await strapi.plugins.upload.services.upload.uploadFileAndPersist(file);
};


const importRelations = async (sourceItem, fieldMapping, cache) => {

  let uid
  const updatedItem = {};

  for (const sourceField of Object.keys(fieldMapping)) {
    const {destination, collection, collectionCol} = fieldMapping[sourceField];
    const entryValue = sourceItem[sourceField]
    if (!entryValue) {
      continue;
    }
    if (!destination || destination === "none" || !collection || collection === "none" || !collectionCol || collectionCol === "none") {
      if (Object.keys(fieldMapping[sourceField]).includes(ID_KEY)) {
        uid = entryValue
      }
      continue;
    }
    let relatedStrapi
    if (entryValue.includes(',')) {
      relatedStrapi = []
      const related = JSON.parse(entryValue)
      for (const r of related) {
        if (!(r in cache)) {
          cache[r] = await strapi.query(collection).findOne({[collectionCol]: r})
        }
        relatedStrapi.push(cache[r])
      }
    } else {
      if (!(entryValue in cache)) {
        cache[entryValue] = await strapi.query(collection).findOne({[collectionCol]: entryValue})
      }
      relatedStrapi = cache[entryValue]
    }
    updatedItem[destination] = relatedStrapi;
  }
  return {uid, updatedItem};
};

const importFields = async (sourceItem, fieldMapping) => {
  const importedItem = {};
  for (const sourceField of Object.keys(fieldMapping)) {
    const {destination, importMediaToField} = fieldMapping[sourceField];
    if (!destination || destination === "none") {
      continue;
    }
    if (importMediaToField) {
      const urls = getMediaUrlsFromFieldData(sourceItem[sourceField]);
      const fileBuffers = await Promise.all(_.uniq(urls).map(fetchFiles));
      const storedFiles = await Promise.all(fileBuffers.map(storeFiles))
      importedItem[destination] = storedFiles.map(file => file.id)
    } else {
      importedItem[destination] = sourceItem[sourceField];
    }
  }
  return importedItem;
};


module.exports = {
  importFields,
  importRelations
};
