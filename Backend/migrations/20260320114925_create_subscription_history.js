/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('subscription_history', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.uuid('subscription_id').notNullable().references('id').inTable('subscriptions').onDelete('CASCADE');
    table.enum('old_status', ['active', 'cancelled', 'expired']);
    table.enum('new_status', ['active', 'cancelled', 'expired']);
    table.timestamp('changed_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('subscription_history');
};
