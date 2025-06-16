import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table.string('phone');
    table.string('department');
    table.string('employeeId');
    table.string('studentId');
    table.string('roomNumber');
    table.date('enrollmentDate');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('phone');
    table.dropColumn('department');
    table.dropColumn('employeeId');
    table.dropColumn('studentId');
    table.dropColumn('roomNumber');
    table.dropColumn('enrollmentDate');
  });
}
