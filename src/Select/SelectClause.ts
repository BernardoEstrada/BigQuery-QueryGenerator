import { Formatter, CompileProps, DefaultCompileProps } from '../utils';
import { Field, FieldParams } from './Field';

export interface SelectClauseParams {
  fields: (Field | FieldParams | string)[];
}

export class SelectClause {
  private fields: Field[];

  constructor() {
    this.fields = [];
  }

  public static new(params: SelectClauseParams = { fields: [] }) {
    const { fields } = params;
    const res = new SelectClause();
    if (fields) res.Fields(fields);
    return res;
  }

  public Fields(fields: (Field | FieldParams | string)[]) {
    fields.forEach(f => this.Field(f), this);
    return this;
  }

  public Field(field: Field | FieldParams | string) {
    if (typeof field === 'string') this.fields.push(Field.new().Selector(field));
    else if (!(field instanceof Field)) this.fields.push(Field.new(field));
    else if (field) this.fields.push(field);
    return this;
  }

  public verify() {
    this.fields.forEach(f => f.verify());
  }

  public compile(params: CompileProps = {}) {
    this.verify();
    const { indentSize, debug, parsed } = DefaultCompileProps(params);
    let res = Formatter.formatLine('SELECT', indentSize);
    res += this.fields.map((f, i, a) => f.mapCompile(f, i, a.length, indentSize+1)).join('');

    if (parsed) return Formatter.parseTokens(res, debug);
    return res;
  }
}
