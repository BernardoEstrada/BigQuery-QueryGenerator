export class Formatter {
  private DEBUG = false;
  private baseIndent = 0;

  public static NEWLINE_TOKEN = '$$newline_token$$';
  public static INDENT_TOKEN = '$$indent_token$$';

  public static indent(indentSize: number) {
    if (indentSize < 0) indentSize = 0;
    return Array(indentSize + 1).join(this.INDENT_TOKEN);
  }

  public static newline() {
    return this.NEWLINE_TOKEN;
  }

  public static formatLine(line: string, indentSize = 0, newline = true) {
    return `${this.indent(indentSize)}${line}${newline ? this.newline() : ''}`;
  }

  public static parseTokens(
    text: string,
    debug = false,
    replacements = {
      newline: debug?'\n':' ',
      indent: debug?'  ':''
    }
  ) {
    return text.replaceAll(this.NEWLINE_TOKEN, replacements.newline).replaceAll(this.INDENT_TOKEN, replacements.indent);
  }

  constructor(baseIndent = 0, debug = false) {
    this.DEBUG = debug;
    this.baseIndent = baseIndent;
  }

  public indent(indentSize: number) {
    return Formatter.indent(this.baseIndent + indentSize);
  }

  public newline() {
    return Formatter.newline();
  }

  public formatLine(line: string, indentSize = this.baseIndent, newline = true) {
    return Formatter.formatLine(line, indentSize, newline);
  }
}
