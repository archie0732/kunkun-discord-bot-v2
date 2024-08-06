export function isNumeric(input: string): boolean {
  const numericRegex = /^[0-9]+$/;
  return numericRegex.test(input);
}
