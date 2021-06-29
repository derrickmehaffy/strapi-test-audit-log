"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */

module.exports = {
  lifecycles: {
    afterCreate(result, data) {
      strapi.config.functions["createAuditLog"](
        "create",
        result.id,
        "article",
        result.created_by,
        {
          data,
          params: {},
        },
        result
      );
    },
    afterUpdate(result, params, data) {
      // Checking for publish/unpublish/update on the published_at
      let keys = Object.keys(data);
      let action;

      if (
        keys.length == 1 &&
        keys[0] === "published_at" &&
        data.published_at === null
      ) {
        action = "unpublish";
      } else if (
        keys.length == 1 &&
        keys[0] === "published_at" &&
        data.published_at !== null
      ) {
        action = "publish";
      } else {
        action = "update";
      }

      // Sending the log
      strapi.config.functions["createAuditLog"](
        action,
        params.id,
        "article",
        result.updated_by,
        {
          data,
          params,
        },
        result
      );
    },
    afterDelete(result, params) {
      strapi.config.functions["createAuditLog"](
        "delete",
        result.id,
        "article",
        result.created_by,
        {
          data: {},
          params,
        },
        result
      );
    },
  },
};
