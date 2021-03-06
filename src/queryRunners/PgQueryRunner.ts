import { QueryRunner, DatabaseType } from "./QueryRunner"
import { ClientBase } from 'pg'

export class PgQueryRunner implements QueryRunner {
    readonly postgreSql: true = true
    readonly database: DatabaseType
    readonly connection: ClientBase

    constructor(connection: ClientBase) {
        this.connection = connection
        this.database = 'postgreSql'
    }

    getNativeConnection(): ClientBase {
        return this.connection
    }

    executeSelectOneRow(query: string, params: any[]): Promise<any> {
        return this.connection.query(query, params).then((result) => {
            if (result.rows.length > 1) {
                throw new Error('Too many rows, expected only zero or one row')
            }
            result.rows[0]
        })
    }
    executeSelectManyRows(query: string, params: any[]): Promise<any[]> {
        return this.connection.query(query, params).then((result) => result.rows)
    }
    executeSelectOneColumnOneRow(query: string, params: any[]): Promise<any> {
        return this.connection.query({ text: query, values: params, rowMode: 'array' }).then((result) => {
            if (result.rows.length > 1) {
                throw new Error('Too many rows, expected only zero or one row')
            }
            const row = result.rows[0]
            if (row) {
                if (row.length > 1) {
                    throw new Error('Too many columns, expected only one column')
                }
                return row[0]
            } else {
                return undefined
            }
        })
    }
    executeSelectOneColumnManyRows(query: string, params: any[]): Promise<any[]> {
        return this.connection.query({ text: query, values: params, rowMode: 'array' }).then((result) => result.rows.map((row) => {
            if (row.length > 1) {
                throw new Error('Too many columns, expected only one column')
            }
            return row[0]
        }))
    }
    executeInsert(query: string, params: any[]): Promise<number> {
        return this.connection.query(query, params).then((result) => result.rowCount)
    }
    executeInsertReturningLastInsertedId(query: string, params: any[]): Promise<any> {
        return this.connection.query({ text: query, values: params, rowMode: 'array' }).then((result) => {
            if (result.rows.length > 1) {
                throw new Error('Too many rows, expected only zero or one row')
            }
            const row = result.rows[0]
            if (row) {
                if (row.length > 1) {
                    throw new Error('Too many columns, expected only one column')
                }
                return row[0]
            } else {
                throw new Error('Unable to find the last inserted id')
            }
        })
    }
    executeUpdate(query: string, params: any[]): Promise<number> {
        return this.connection.query(query, params).then((result) => result.rowCount)
    }
    executeDelete(query: string, params: any[]): Promise<number> {
        return this.connection.query(query, params).then((result) => result.rowCount)
    }
    executeProcedure(query: string, params: any[]): Promise<void> {
        return this.connection.query(query, params).then(() => undefined)
    }
    executeFunction(query: string, params: any[]): Promise<any> {
        return this.connection.query({ text: query, values: params, rowMode: 'array' }).then((result) => {
            if (result.rows.length > 1) {
                throw new Error('Too many rows, expected only zero or one row')
            }
            const row = result.rows[0]
            if (row) {
                if (row.length > 1) {
                    throw new Error('Too many columns, expected only one column')
                }
                return row[0]
            } else {
                return undefined
            }
        })
    }
    executeBeginTransaction(): Promise<void> {
        return this.connection.query('begin transaction').then(() => undefined)
    }
    executeCommit(): Promise<void> {
        return this.connection.query('commit').then(() => undefined)
    }
    executeRollback(): Promise<void> {
        return this.connection.query('rollback').then(() => undefined)
    }
    addParam(params: any[], value: any): string {
        const index = params.length
        params.push(value)
        return '$' + (index + 1)
    }
    addOutParam(_params: any[], _name: string): string {
        throw new Error('Unsupported output parameters')
    }
}