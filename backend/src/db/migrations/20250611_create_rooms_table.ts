import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('rooms', (table) => {
    table.increments('id').primary();
    table.string('number').notNullable();
    table.string('type').notNullable();
    table.enu('status', ['available', 'occupied', 'maintenance']).notNullable().defaultTo('available');
    table.integer('maxOccupancy').notNullable();
    table.integer('floor');
    table.decimal('rent', 10, 2);
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('rooms');
}
