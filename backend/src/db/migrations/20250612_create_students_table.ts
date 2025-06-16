import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('students', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('email').notNullable().unique();
    table.string('matricule');
    table.string('filiere');
    table.integer('niveau');
    table.date('enrollmentDate');
    table.string('phone');
    table.integer('roomId').unsigned().references('id').inTable('rooms').onDelete('SET NULL');
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('students');
}
