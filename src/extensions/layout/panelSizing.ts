/** react-resizable-panels treats numeric defaultSize as pixels; strings without units are percentages. */
export function percentSize(value: number): string {
  return String(value);
}
