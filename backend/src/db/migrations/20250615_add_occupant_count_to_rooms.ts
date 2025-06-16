import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('rooms', (table) => {
    table.integer('occupantCount').notNullable().defaultTo(0);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('rooms', (table) => {
    table.dropColumn('occupantCount');
  });
}
