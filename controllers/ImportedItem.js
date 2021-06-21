module.exports = {
  count: async ctx => {
    const entries = await strapi.query("importeditem", "import-relations").count(ctx.request.query)
    ctx.send(entries)
  },
  findOne: async ctx => {
    const entries = await strapi.query("importeditem", "import-relations").findOne({id: ctx.params.importId})
    ctx.send(entries)
  },
  find: async ctx => {
    const entries = await strapi.query("importeditem", "import-relations").find(ctx.request.query)
    ctx.send(entries)
  },
  delete: async ctx => {
    return strapi.query("importeditem", "import-relations").delete({id: ctx.params.importId})
  },
  update: async ctx => {
    return strapi.query("importeditem", "import-relations").update({id: ctx.params.importId}, ctx.request.body)
  }
};