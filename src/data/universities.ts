export interface University {
  id: number;
  name: string;
  city: string;
  country: string;
}

/** Mirrors the seed data in supabase/migrations/0014_universities_numeric_id.sql. */
export const universities: University[] = [
  { id: 1, name: 'University of Luxembourg', city: 'Esch-sur-Alzette', country: 'Luxembourg' },
  { id: 2, name: 'LUNEX University', city: 'Differdange', country: 'Luxembourg' },
  { id: 3, name: 'Sacred Heart University Luxembourg', city: 'Luxembourg City', country: 'Luxembourg' },
  { id: 4, name: 'Miami University Dolibois European Center', city: 'Differdange', country: 'Luxembourg' },
  { id: 5, name: 'University of Trier', city: 'Trier', country: 'Germany' },
  { id: 6, name: 'Saarland University', city: 'Saarbrücken', country: 'Germany' },
  { id: 7, name: 'University of Liège', city: 'Liège', country: 'Belgium' },
  { id: 8, name: 'KU Leuven', city: 'Leuven', country: 'Belgium' },
  { id: 9, name: 'University of Lorraine', city: 'Nancy', country: 'France' },
  { id: 10, name: 'Other / Not Listed', city: '—', country: '—' },
];
