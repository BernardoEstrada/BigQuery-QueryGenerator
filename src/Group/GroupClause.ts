import { Formatter, CompileProps, DefaultCompileProps, Configs } from '../utils';
import { GroupField } from './GroupField';


export interface GroupClauseParams {
  fields: (GroupField | string)[];
}

export class GroupClause {
  private fields: GroupField[];

  constructor() {
    this.fields = [];
  }

  public static new(params: GroupClauseParams = { fields: [] }) {
    const { fields } = params;
    const res = new GroupClause();

    if (fields) res.Fields(fields);
    return res;
  }

  public Fields(fields: (GroupField | string)[]) {
    fields.forEach(f => this.Field(f), this);
    return this;
  }

  public Field(field: GroupField | string) {
    if (typeof field === 'string') this.fields.push(GroupField.new().Selector(field));
    else if (field) this.fields.push(field);
    return this;
  }

  public verify() {
    if (this.fields.length === 0) throw new Error('GroupClause must have at least one field');
  }

  public compile(props: CompileProps = {}): string {
    const { indentSize, debug, parsed } = DefaultCompileProps(props);
    this.verify();
    let res = '';
    const oneLine = this.fields.length <= Configs.MAX_GROUP_SINGLELINE;
    res += Formatter.formatLine('GROUP BY', indentSize, !oneLine);
    res += this.fields.map((f, i, a) => f.compile({ indentSize: indentSize + 1, isLast: i === a.length - 1, oneLine })).join('');

    if (parsed) return Formatter.parseTokens(res, debug);
    return res;
  }
}
