export default function stringToNumber(str: string): number {
  if (str === "") {
    return 0;
  }
  const num = Number(str);
  if (isNaN(num)) {
    throw new Error(`Invalid number: ${str}`);
  }
  return num;
}
