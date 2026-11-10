// scripts/.overkill.js – simple flag module
// Export the current OVERKILL mode. The value is written by toggle-overkill.mjs.
export const OVERKILL = process.env.OVERKILL || 'OFF';
