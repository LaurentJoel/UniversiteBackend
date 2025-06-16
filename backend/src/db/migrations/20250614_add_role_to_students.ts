import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Add role column to students table
  return knex.schema.alterTable('students', (table) => {
    table.string('role').defaultTo('student'); // Add role column with default value 'student'
    // Phone column already exists, so we don't add it again
  });
}

export async function down(knex: Knex): Promise<void> {
  // Remove the columns if needed to rollback
  return knex.schema.alterTable('students', (table) => {
    table.dropColumn('role');
    // Don't drop the phone column as it existed before this migration
  });
}
