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
    const importConfig = ctx.request.body;
    importConfig.ongoing = true;
    const record = await strapi
      .query("importconfig", "import-csv")
      .create(importConfig);
    await services["import-csv"].importItems(record, ctx);
    ctx.send(record);
  },

  index: async ctx => {
    const entries = await strapi.query("importconfig", "import-csv").find();
    const withCounts = entries.map(entry => ({
      ...entry,
      importedCount: entry.importeditems.length,
      importeditems: []
    }));
    const withName = withCounts.map(entry =>
      ({
        ...entry,
        contentType: strapi.contentTypes[entry.contentType].info.name ||
          entry.contentType
      }))
    ctx.send(withName);
  },
  delete: async ctx => {
    const importId = ctx.params.importId;
    const res = await strapi.query("importconfig", "import-content").delete({
      id: importId
    });
    if (res && res.id) {
      ctx.send(res.id);
    } else {
      ctx.response.status = 400;
      ctx.response.message = "could not delete: the provided id might be wrong";
    }
  },
  undo: async ctx => {
    const services = strapi.plugins["import-csv"].services;
    const importId = ctx.params.importId;
    const importConfig = await strapi
      .query("importconfig", "import-csv")
      .findOne({ id: importId });
    console.log("undo", importId);
    await services["import-csv"].undoItems(importConfig);
    ctx.send(importConfig);
  }
};
