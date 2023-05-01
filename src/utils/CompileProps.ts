export interface CompileProps {
  nested?: boolean;
  indentSize?: number;
  parsed?: boolean;
  debug?: boolean;
  isLast?: boolean;
  oneLine?: boolean;
}

export function DefaultCompileProps(props: CompileProps): CompileProps {
  return {
    nested: props.nested || false,
    indentSize: props.indentSize || 0,
    parsed: props.parsed || false,
    debug: props.debug || false,
    isLast: props.isLast || false,
    oneLine: props.oneLine || false
  };
}
