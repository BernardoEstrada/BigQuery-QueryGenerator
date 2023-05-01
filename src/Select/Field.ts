import { Formatter, CheckForInjection, CompileProps, DefaultCompileProps } from '../utils';
import { StructSelector, StructSelectorParams } from './StructSelector';

export interface FieldParams {
  selector: string | (StructSelector | StructSelectorParams)[];
  outputName?: string;
}

export class Field {
  private selector: string | StructSelector[];
  private outputName?: string;

  constructor() {
    this.selector = undefined;
    this.outputName = undefined;
  }

  public static new(params: FieldParams = { selector: undefined }) {
    const { selector, outputName } = params;
    const res = new Field();
    if (selector) res.Selector(selector);
    if (outputName) res.OutputName(outputName);
    return res;
  }

  public Selector(selector: string | (StructSelector | StructSelectorParams)[] | undefined) {
    if (typeof selector === 'string') {
      CheckForInjection(selector);
      this.selector = selector;
    }
    else if (selector) {
      this.selector = selector.map(s => {
        if (s instanceof StructSelector) return s;
        else if (s) return StructSelector.new(s);
      });
    }
    return this;
  }

  public OutputName(outputName: string | undefined) {
    CheckForInjection(outputName);
    this.outputName = outputName;
    return this;
  }

  public verify() {
    if (Array.isArray(this.selector) && !this.outputName) throw new Error('Structs must have an output name');
    if (Array.isArray(this.selector)) this.selector.forEach(s => s.verify());
  }

  public compile(props: CompileProps = {}): string {
    const { indentSize, debug, parsed, isLast } = DefaultCompileProps(props);
    this.verify();
    let res = '';
    let endField = '';
    if (this.selector instanceof Array) {
      res += Formatter.formatLine('STRUCT(', indentSize);
      res += this.selector.map((s, i, a) => s.mapCompile(s, i, a.length, indentSize+1)).join('');
      endField += ')';
    }
    else endField = this.selector;
    if (this.outputName) endField += ` AS ${this.outputName}`;
    if (isLast) endField += ',';
    res += Formatter.formatLine(endField, indentSize);

    if (parsed) return Formatter.parseTokens(res, debug);
    return res;
  }

  public mapCompile(value: Field, index: number, length: number, indentSize = 0) {
    return value.compile({
      isLast: index < length - 1,
      indentSize
    });
  }
}



