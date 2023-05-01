import { Formatter, CheckForInjection, CompileProps, DefaultCompileProps } from './utils';
import { SelectClause, SelectClauseParams } from './Select';
import { WhereClause, WhereClauseParams } from './Where';
import { GroupClause, GroupClauseParams } from './Group';
import { OrderClause, OrderClauseParams } from './Order';

export interface QueryFactoryParams {
  source: string | QueryFactory;
  select: SelectClause | SelectClauseParams;
  where?: WhereClause | WhereClauseParams;
  group?: GroupClause | GroupClauseParams;
  order?: OrderClause | OrderClauseParams;
}

export class QueryFactory {
  private source: string | QueryFactory;
  private select: SelectClause;
  private where: WhereClause;
  private group: GroupClause;
  private order: OrderClause;

  public constructor() {
    this.source = undefined;
    this.select = undefined;
    this.where = undefined;
    this.group = undefined;
    this.order = undefined;
  }

  public static new(params: QueryFactoryParams = { source: undefined, select: undefined }) {
    const { source, select, where, group, order } = params;
    const res = new QueryFactory();

    if (source) res.Source(source);
    if (select) res.Select(select);
    if (where) res.Where(where);
    if (group) res.Group(group);
    if (order) res.Order(order);
    return res;
  }

  public Source(source: string | QueryFactory) {
    if (typeof source === 'string') CheckForInjection(source);
    this.source = source;
    return this;
  }

  public Select(select: SelectClause | SelectClauseParams) {
    if (select instanceof SelectClause) this.select = select;
    else if (select) this.select = SelectClause.new(select);
    return this;
  }

  public Where(where: WhereClause | WhereClauseParams) {
    if (where instanceof WhereClause) this.where = where;
    else if (where) this.where = WhereClause.new(where);
    return this;
  }

  public Group(grup: GroupClause | GroupClauseParams) {
    if (grup instanceof GroupClause) this.group = grup;
    else if (grup) this.group = GroupClause.new(grup);
    return this;
  }

  public Order(order: OrderClause | OrderClauseParams) {
    if (order instanceof OrderClause) this.order = order;
    else if (order) this.order = OrderClause.new(order);
    return this;
  }


  public compile(props: CompileProps = {}): string {
    const { indentSize, debug, parsed, nested } =
      DefaultCompileProps({ parsed: props.parsed || true, ...props });

    let res = '';
    res += this.select.compile({ debug, indentSize: indentSize });
    if (this.source instanceof QueryFactory) {
      res += Formatter.formatLine('FROM (', indentSize);
      res += Formatter.formatLine(this.source.compile({ debug, indentSize: indentSize+1, nested: true }));
      res += Formatter.formatLine(')', indentSize);
    }
    else {
      res += Formatter.formatLine(`FROM \`${'BIG_QUERY_PROJECT_ID'}.${'datasetId'}.${this.source}\``, indentSize);
    }

    res += this.where ? Formatter.formatLine(this.where.compile({ debug, indentSize })) : '';
    res += this.group ? Formatter.formatLine(this.group.compile({ debug, indentSize })) : '';
    res += this.order ? Formatter.formatLine(this.order.compile({ debug, indentSize }), 0, !nested) : '';

    if (parsed) return Formatter.parseTokens(res.trim(), debug);
    return res.trim();
  }
}


