import fs from 'fs';
import path from 'path';

// Parse aliases from the isolated external data contract
const aliasesFilePath = path.join(process.cwd(), 'data', 'aliases.json');
const rawAliases = fs.readFileSync(aliasesFilePath, 'utf-8');
const COMPANY_ALIASES: Record<string, string> = JSON.parse(rawAliases);

/**
 * Normalizes raw company input strings by mapping long forms 
 * (e.g., "Tata Consultancy Services") to clean slugs (e.g., "tcs").
 */
export function normalizeCompanyName(rawName: string): string {
  if (!rawName) return '';

  // 1. Lowercase, strip punctuation, remove multiple spaces, and trim
  const cleanName = rawName
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // 2. Map long names to short canonical slugs via dictionary lookup
  // Fallback to auto-slugging the cleaned name if not found in the alias map
  return COMPANY_ALIASES[cleanName] || cleanName.replace(/\s+/g, '-');
}
