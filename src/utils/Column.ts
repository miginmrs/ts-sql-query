import { ITableOrView } from "./ITableOrView"
import { ToSql } from "../sqlBuilders/SqlBuilder"
import { ValueSource, __ValueSourcePrivate } from "../expressions/values"

export class Column {
    // @ts-ignore
    protected ___column: 'column'
}

export interface __ColumnPrivate extends __ValueSourcePrivate {
    __name: string
    __table_or_view: ITableOrView<any>
    __isOptional: boolean
    __hasDefault: boolean
    __isPrimaryKey: boolean
    __isAutogeneratedPrimaryKey: boolean
    __sequenceName?: string
}

export function __getColumnPrivate(column: Column): __ColumnPrivate {
    return column as any
}

export function __getColumnOfTable(table: ITableOrView<any>, column: string): (Column & ToSql) | undefined {
    const result = (table as any)[column]
    if (!result) {
        return undefined
    }
    if (result instanceof ValueSource) { // we don't check result against Column because Column is used as an interface
        return result as any
    } else {
        return undefined
    }
}