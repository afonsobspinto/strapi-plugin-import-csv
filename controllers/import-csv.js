'use strict';

/**
 * import-csv.js controller
 *
 * @description: A set of functions called "actions" of the `import-csv` plugin.
 */

module.exports = {
  preAnalyzeImportFile: async ctx => {
    const services = strapi.plugins["import-csv"].services;
    try {
      const data = await services["import-csv"].preAnalyzeImportFile(ctx);
      ctx.send(data);
    } catch (error) {
      console.error(error);
      ctx.response.status = 406;
      ctx.response.message = "could not parse: " + error;
    }
  },
  create: async ctx => {
    const services = strapi.plugins["import-csv"].services;
    const record = await services["import-csv"].importItems(ctx);
    ctx.send(record);
  },
};
