import { Formatter, CompileProps, DefaultCompileProps, Configs } from '../utils';
import { WhereOperators } from './WhereOperators';
import { WhereOperation, WhereOperationParams } from './WhereOperation';

export interface WhereClauseParams {
  operator: WhereOperators;
  operations: (WhereOperation | WhereClause | WhereOperationParams | WhereClauseParams)[];
  not?: boolean;
}

export class WhereClause {
  private operator: WhereOperators;
  private operations: (WhereOperation | WhereClause)[];
  private not: boolean;

  constructor() {
    this.not = false;
    this.operator = WhereOperators.AND;
    this.operations = [];
  }

  public static new(params: WhereClauseParams = { operator: undefined, operations: [] }) {
    const { not, operator, operations } = params;
    const res = new WhereClause();
    if (not) res.Not();
    if (operator) res.Operator(operator);
    if (operations) res.Operations(operations);
    return res;
  }

  public Not() {
    this.not = true;
    return this;
  }

  public setNot(not: boolean) {
    this.not = not;
    return this;
  }

  public Operator(operator: WhereOperators | undefined) {
    this.operator = operator;
    return this;
  }

  public Operations(operations: (WhereOperation | WhereOperationParams | WhereClauseParams | WhereClause)[]) {
    operations.forEach(o => this.Operation(o), this);
    return this;
  }

  public Operation(operation: WhereOperation | WhereClause | WhereOperationParams | WhereClauseParams | undefined) {
    if (operation instanceof WhereOperation || operation instanceof WhereClause) this.operations.push(operation);
    else if (operation && 'comparator' in operation) this.operations.push(WhereOperation.new(operation));
    else if (operation && 'operator' in operation) this.operations.push(WhereClause.new(operation));
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
    if (this.operations.length === 0) throw new Error('Missing operations');
    if (this.operations.length > 1 && !this.operator) throw new Error('Missing operator');
  }

  public compile(props: CompileProps = {}): string {
    const { nested, indentSize, debug, parsed } = DefaultCompileProps(props);
    this.verify();
    let res = '';

    const oneLine = this.operations.length < Configs.MAX_WHERE_SINGLELINE && this.operations.every(o => o instanceof WhereOperation);
    res += this.operations
      .map((operation, i, a) => {
        let line = '';
        if (operation instanceof WhereClause) {
          line += Formatter.formatLine(`${this.operator} (`, indentSize + 1, !oneLine);
          line += `${operation.compile({ nested: true, indentSize: indentSize + 1 })}`;
          line += Formatter.formatLine(')', indentSize + 1, i < a.length - 1);
        }
        else {
          line += `${operation.compile(i > 0 ? this.operator : undefined, { indentSize: indentSize + 1, isLast: i === a.length - 1, oneLine, nested })}`;
        }

        return oneLine ? ` ${line}` : line;
      }, this)
      .join('');

    if (this.not) res = `NOT (${res})`;
    res = nested ? res : `${Formatter.formatLine('WHERE', indentSize, !oneLine)}${res}`;

    if (parsed) return Formatter.parseTokens(res, debug);
    return res;
  }
}


      // .map((operation, i) => {
      //   let line = '';
      //   if (i > 0) {
      //     line += nested ? `${this.operator} ` : Formatter.formatLine(`${this.operator} (`, indentSize - 1);
      //   }
      //   if (operation instanceof WhereClause) {
      //     line += `${operation.compile({ nested: true, indentSize: indentSize + 1 })}`;
      //   } else line += `${operation.compile()}`;
      //   if (i > 0 && !nested) line += Formatter.formatLine(')', indentSize+1, false);
      //   return Formatter.formatLine(line, indentSize + 1);
      // }, this)
      // .join('');
