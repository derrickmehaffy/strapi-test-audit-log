"use strict";

const { sanitizeEntity } = require("strapi-utils");

module.exports = (strapi) => {
  return {
    beforeInitialize() {
      strapi.config.middleware.load.after.unshift("audit-log");
    },
    initialize() {
      strapi.app.use(async (ctx, next) => {
        await next();

        let route = ctx.request.route;

        if (
          route &&
          route.controller &&
          route.controller === "collection-types" &&
          route.plugin === "content-manager" &&
          ctx.params.model !== "plugins::audit-log.audit-log"
        ) {
          let model = strapi.getModel(ctx.params.model);
          let action = route.action;
          let data = ctx.response.body;
          let cleanData = await sanitizeEntity(data, {
            model: strapi.models[model.apiName],
          });

          const actions = [
            "create",
            "update",
            "delete",
            "bulkdelete",
            "publish",
            "unpublish",
          ];

          let payload = {
            action,
            model: model.apiName,
            entry_id: data.id,
            user: ctx.state.user.id,
            input: {
              data: ctx.request.body,
              params: ctx.params,
            },
            result: cleanData,
          };

          if (actions.includes(action) === true) {
            await strapi.query("audit-log", "audit-log").create(payload);
          }
        }
      });
    },
  };
};
