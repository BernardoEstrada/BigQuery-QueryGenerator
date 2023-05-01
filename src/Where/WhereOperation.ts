import { CheckForInjection, CompileProps, DefaultCompileProps, Formatter } from '../utils';
import { WhereComparators } from './WhereComparators';
import { WhereOperators } from './WhereOperators';

export interface WhereOperationParams {
  field: string,
  comparator: WhereComparators,
  value?: string | number | boolean | string[] | number[] | boolean[],
  valueIsField?: boolean
}

export class WhereOperation {
  private field: string;
  private comparator: WhereComparators;
  private value?: string | number | boolean | (string | number | boolean)[];
  private valueIsField?: boolean;

  public static nullComparators = [WhereComparators.IS_NULL, WhereComparators.IS_NOT_NULL];
  public static arrayComparators = [WhereComparators.IN, WhereComparators.NOT_IN];

  constructor() {
    this.field = undefined;
    this.comparator = undefined;
    this.value = undefined;
    this.valueIsField = undefined;
  }

  public static new(params: WhereOperationParams = { field: undefined, comparator: undefined }) {
    const { field, comparator, value, valueIsField } = params;
    const res = new WhereOperation();
    if (field) res.Field(field);
    if (comparator) res.Comparator(comparator);
    if (value) res.Value(value);
    if (valueIsField) res.ValueAsField();
    return res;
  }

  public Field(field: string) {
    CheckForInjection(field);
    this.field = field;
    return this;
  }

  public Comparator(comparator: WhereComparators) {
    this.comparator = comparator;
    return this;
  }

  public Value(value: string | number | boolean | (string | number | boolean)[]) {
    if (Array.isArray(value)) value.forEach(v => { if (typeof v === 'string') CheckForInjection(v); });
    if (typeof value === 'string') CheckForInjection(value);
    this.value = value;
    return this;
  }

  public ValueAsField() {
    this.valueIsField = true;
    return this;
  }

  public test(): { ok: boolean; error?: string } {
    try {
      this.verify();
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }

  private verify() {
    if (!this.field || !this.comparator) throw new Error('Missing field or comparator');
    if (WhereOperation.nullComparators.includes(this.comparator) && this.value) {
      throw new Error('Value not allowed for this comparator');
    }
    if (!WhereOperation.nullComparators.includes(this.comparator) && !this.value) {
      throw new Error('Missing Value');
    }
    if (WhereOperation.arrayComparators.includes(this.comparator) && !Array.isArray(this.value)) {
      throw new Error('Invalid comparator for non-array value');
    }
    if (!WhereOperation.arrayComparators.includes(this.comparator) && Array.isArray(this.value)) {
      throw new Error('Invalid comparator for array value');
    }
    return this;
  }

  public compile(operator: WhereOperators, props: CompileProps = {}): string {
    const { indentSize, debug, parsed, isLast, oneLine, nested } = DefaultCompileProps(props);
    this.verify();
    let value = this.value;

    if (this.comparator && WhereOperation.nullComparators.includes(this.comparator)) {
      return `${this.field} ${this.comparator}`;
    }

    if (Array.isArray(value)) {
      value = `(${value.map(v => (typeof v === 'string' ? `"${v}"` : `${v}`)).join(', ')})`;
    }
    else if (!this.valueIsField) value = `"${value}"`;

    let res = '';
    if (operator) res += `${operator} `;
    res += `${this.field} ${this.comparator} ${value}`;

    res = Formatter.formatLine(res, oneLine ? 0 : indentSize, ((!isLast || nested) && !oneLine));

    if (parsed) return Formatter.parseTokens(res, debug);
    return res;
  }
}
