import { Formatter, CheckForInjection, CompileProps, DefaultCompileProps } from '../utils';
import { Aggregates } from './Aggregates';

export interface StructSelectorParams {
  field: string;
  source?: string;
  aggregate?: Aggregates;
  outputName?: string;
}

export class StructSelector {
  private field: string;
  private source?: string;
  private aggregate?: Aggregates;
  private outputName?: string;

  constructor() {
    this.field = undefined;
    this.source = undefined;
    this.aggregate = undefined;
  }

  public static new(params: StructSelectorParams = { field: undefined }) {
    const { field, aggregate, source, outputName } = params;
    const res = new StructSelector();

    if (field) res.Field(field);
    if (aggregate) res.Aggregate(aggregate);
    if (source) res.Source(source);
    if (outputName) res.OutputName(outputName);
    return res;
  }

  public Field(field: string) {
    CheckForInjection(field);
    this.field = field;
    return this;
  }

  public Source(source: string) {
    CheckForInjection(source);
    this.source = source;
    return this;
  }

  public Aggregate(aggregate: Aggregates) {
    this.aggregate = aggregate;
    return this;
  }

  public OutputName(outputName: string) {
    CheckForInjection(outputName);
    this.outputName = outputName;
    return this;
  }

  public verify() {
    if (!this.field) throw new Error('StructSelector must have a field');
  }

  public compile(params: CompileProps) {
    const { isLast, indentSize } = DefaultCompileProps(params);
    let res = '';
    if (this.aggregate) res += `${this.aggregate}(`;
    if (this.source) res += `${this.source}.`;
    res += this.field;
    if (this.aggregate) res += ')';
    if (this.outputName) res += ` AS ${this.outputName}`;
    if (isLast) res += ',';
    res = Formatter.formatLine(res, indentSize);
    return res;
  }

  public mapCompile(value: StructSelector, index: number, length: number, indentSize = 0) {
    return value.compile({
      isLast: index < length - 1,
      indentSize
    });
  }
}

