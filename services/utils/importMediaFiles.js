const _ = require("lodash");
const request = require("request");
const fileFromBuffer = require("./fileFromBuffer");
const {getMediaUrlsFromFieldData} = require("../utils/fieldUtils");

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
const relateFileToContent =  ({
                                     contentType,
                                     contentId,
                                     targetField,
                                     fileBuffer
                                   }) => {
  try{
    fileBuffer.related = [
      {
        refId: contentId,
        ref: contentType,
        source: "content-manager",
        field: targetField
      }
    ];
  }
  catch (e) {
    console.log(e)
  }
  return fileBuffer;
};
const importMediaFiles = async (savedContent, sourceItem, fieldMapping, contentType) => {
  const uploadedFileDescriptors = _.mapValues(
    fieldMapping,
    async (mapping, sourceField) => {
      if (mapping.importMediaToField) {
        const urls = getMediaUrlsFromFieldData(sourceItem[sourceField]);
        const fetchPromises = _.uniq(urls).map(fetchFiles);
        const fileBuffers = await Promise.all(fetchPromises);
        const relatedContents = fileBuffers.map(fileBuffer =>
          relateFileToContent({
            contentType,
            contentId: savedContent.id,
            targetField: mapping.importMediaToField,
            fileBuffer
          })
        );
        const storePromises = relatedContents.map(storeFiles);
        const storedFiles = await Promise.all(storePromises);
        console.log(_.flatten(storedFiles));
        return storedFiles;
      }
    }
  );
  return await Promise.all(_.values(uploadedFileDescriptors));
};
module.exports = importMediaFiles;
