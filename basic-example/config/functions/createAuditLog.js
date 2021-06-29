const { sanitizeEntity } = require("strapi-utils");

module.exports = async (action, entryID, model, user, input, result) => {
  let cleanResult = await sanitizeEntity(result, {
    model: strapi.models[model],
  });

  let log = await strapi.query("audit-log").create({
    action,
    model,
    entry_id: entryID,
    user: user.id,
    input,
    result: cleanResult,
  });

  return log;
};
