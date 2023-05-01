import { Formatter, CheckForInjection, CompileProps, DefaultCompileProps } from '../utils';


export interface GroupFieldParams {
  selector: string;
}

export class GroupField {
  private selector: string;

  constructor() {
    this.selector = undefined;
  }

  public static new(params: GroupFieldParams = { selector: undefined }) {
    const { selector } = params;
    const res = new GroupField();

    if (selector) res.Selector(selector);
    return res;
  }

  public Selector(selector: string | undefined) {
    CheckForInjection(selector);
    this.selector = selector;
    return this;
  }

  public verify() {
    if (!this.selector) throw new Error('GroupField must have a selector');
  }

  public compile(props: CompileProps = {}): string {
    const { indentSize, debug, parsed, isLast, oneLine } = DefaultCompileProps(props);
    this.verify();
    let res = '';
    if (oneLine) res += ' ';
    res += this.selector;
    if (!isLast) res += ',';

    res = Formatter.formatLine(res, oneLine ? 0 : indentSize, (!oneLine && !isLast));

    if (parsed) return Formatter.parseTokens(res, debug);
    return res;
  }
}
