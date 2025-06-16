import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('rooms', (table) => {
    table.bigInteger('rent').alter();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('rooms', (table) => {
    table.decimal('rent', 10, 2).alter();
  });
}
