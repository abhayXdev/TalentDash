/**
 * Validates if a new submission falls within a +/- 10% margin of an existing submission.
 * Uses native BigInt math to prevent JS precision overflow or type coercion errors.
 */
export function isDuplicateCompensation(
  existingComp: bigint,
  newComp: bigint
): boolean {
  // 10% margin = existing / 10n
  const margin = existingComp / 10n;
  
  const lowerBound = existingComp - margin;
  const upperBound = existingComp + margin;

  return newComp >= lowerBound && newComp <= upperBound;
}
