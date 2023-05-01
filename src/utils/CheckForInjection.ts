export function CheckForInjection(value: string) {
  const r = RegExp(/(--)|#|'|(\/\*)|(\*\/)|;|(1=1)/);
  const match = r.exec(value);
  if (match)
    throw new Error(`Possible SQL injection detected in '${value}' on token '${match[0]}' at index '${match.index}'`);
}
