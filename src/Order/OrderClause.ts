import { Formatter, CompileProps, DefaultCompileProps, Configs } from '../utils';
import { OrderField, OrderFieldParams } from './OrderField';


export interface OrderClauseParams {
  fields: (OrderField | OrderFieldParams | string)[];
}

export class OrderClause {
  private fields: OrderField[];

  constructor() {
    this.fields = [];
  }

  public static new(params: OrderClauseParams = { fields: [] }) {
    const { fields } = params;
    const res = new OrderClause();

    if (fields) res.Fields(fields);
    return res;
  }

  public Fields(fields: (OrderField | OrderFieldParams | string)[]) {
    fields.forEach(f => this.Field(f), this);
    return this;
  }

  public Field(field: OrderField | OrderFieldParams | string) {
    if (typeof field === 'string') this.fields.push(OrderField.new().Selector(field));
    else if (field instanceof OrderField) this.fields.push(field);
    else if (field) this.fields.push(OrderField.new(field));
    return this;
  }

  public verify() {
    if (this.fields.length === 0) throw new Error('OrderClause must have at least one field');
  }

  public compile(props: CompileProps = {}): string {
    const { indentSize, debug, parsed } = DefaultCompileProps(props);
    this.verify();
    let res = '';
    const oneLine = this.fields.length < Configs.MAX_ORDER_SINGLELINE;
    res += Formatter.formatLine('ORDER BY', indentSize, !oneLine);
    res += this.fields.map((f, i, a) => f.compile({ indentSize: indentSize + 1, isLast: i === a.length - 1, oneLine })).join('');

    if (parsed) return Formatter.parseTokens(res, debug);
    return res;
  }
}
