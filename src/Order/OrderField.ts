import { Formatter, CheckForInjection, CompileProps, DefaultCompileProps } from '../utils';
import { OrderModifiers } from './OrderModifiers';


export interface OrderFieldParams {
  selector: string;
  modifier?: OrderModifiers;
}

export class OrderField {
  private selector: string;
  private modifier?: OrderModifiers;

  constructor() {
    this.selector = undefined;
    this.modifier = undefined;
  }

  public static new(params: OrderFieldParams = { selector: undefined }) {
    const { selector, modifier } = params;
    const res = new OrderField();

    if (selector) res.Selector(selector);
    if (modifier) res.Modifier(modifier);
    return res;
  }

  public Selector(selector: string | undefined) {
    CheckForInjection(selector);
    this.selector = selector;
    return this;
  }

  public Modifier(modifier: OrderModifiers | undefined) {
    this.modifier = modifier;
    return this;
  }

  public verify() {
    if (!this.selector) throw new Error('OrderField must have a selector');
  }

  public compile(props: CompileProps = {}): string {
    const { indentSize, debug, parsed, isLast, oneLine } = DefaultCompileProps(props);
    this.verify();
    let res = '';
    if (oneLine) res += ' ';
    res += this.selector;
    if (this.modifier) res += ` ${this.modifier}`;
    if (!isLast) res += ',';

    res = Formatter.formatLine(res, oneLine ? 0 : indentSize, (!oneLine && !isLast));

    if (parsed) return Formatter.parseTokens(res, debug);
    return res;
  }
}
