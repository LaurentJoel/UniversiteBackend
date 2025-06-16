import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Update the status enum to replace 'maintenance' with 'complet'
  await knex.raw(`
    ALTER TABLE rooms 
    DROP CONSTRAINT IF EXISTS rooms_status_check;
  `);
  
  // Update any existing 'maintenance' values to 'complet'
  await knex('rooms')
    .where('status', 'maintenance')
    .update('status', 'complet');
  
  // Add the new constraint with 'complet' instead of 'maintenance'
  await knex.raw(`
    ALTER TABLE rooms 
    ADD CONSTRAINT rooms_status_check 
    CHECK (status IN ('available', 'occupied', 'complet'));
  `);
}

export async function down(knex: Knex): Promise<void> {
  // Revert back to maintenance if needed
  await knex.raw(`
    ALTER TABLE rooms 
    DROP CONSTRAINT IF EXISTS rooms_status_check;
  `);
  
  await knex('rooms')
    .where('status', 'complet')
    .update('status', 'maintenance');
  
  await knex.raw(`
    ALTER TABLE rooms 
    ADD CONSTRAINT rooms_status_check 
    CHECK (status IN ('available', 'occupied', 'maintenance'));
  `);
}
