import { QueryRunner, DatabaseType } from "./QueryRunner"
import { Connection, UpsertResult } from 'mariadb'

export class MariaDBQueryRunner implements QueryRunner {
    readonly mySql: true = true
    readonly mariaDB: true = true
    readonly database: DatabaseType
    readonly connection: Connection

    constructor(connection: Connection, database: 'mariaDB' | 'mySql' = 'mariaDB') {
        this.connection = connection
        this.database = database
    }

    getNativeConnection(): Connection {
        return this.connection
    }

    executeSelectOneRow(query: string, params: any[]): Promise<any> {
        return this.connection.query({ sql: query, bigNumberStrings: true }, params).then((result: any[]) => {
            if (result.length > 1) {
                throw new Error('Too many rows, expected only zero or one row')
            }
            return result[0]
        })
    }
    executeSelectManyRows(query: string, params: any[]): Promise<any[]> {
        return this.connection.query({ sql: query, bigNumberStrings: true }, params)
    }
    executeSelectOneColumnOneRow(query: string, params: any[]): Promise<any> {
        return this.connection.query({ sql: query, rowsAsArray: true, bigNumberStrings: true }, params).then((result: any[][]) => {
            if (result.length > 1) {
                throw new Error('Too many rows, expected only zero or one row')
            }
            const row = result[0]
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
        return this.connection.query({ sql: query, rowsAsArray: true, bigNumberStrings: true }, params).then((result: any[][]) => result.map((row) => {
            if (row.length > 1) {
                throw new Error('Too many columns, expected only one column')
            }
            return row[0]
        }))
    }
    executeInsert(query: string, params: any[]): Promise<number> {
        return this.connection.query({ sql: query, bigNumberStrings: true }, params).then((result: UpsertResult) => result.affectedRows)
    }
    executeInsertReturningLastInsertedId(query: string, params: any[]): Promise<any> {
        return this.connection.query({ sql: query, bigNumberStrings: true }, params).then((result: UpsertResult) => result.insertId)
    }
    executeUpdate(query: string, params: any[]): Promise<number> {
        return this.connection.query({ sql: query, bigNumberStrings: true }, params).then((result: UpsertResult) => result.affectedRows)
    }
    executeDelete(query: string, params: any[]): Promise<number> {
        return this.connection.query({ sql: query, bigNumberStrings: true }, params).then((result: UpsertResult) => result.affectedRows)
    }
    executeProcedure(query: string, params: any[]): Promise<void> {
        return this.connection.query({ sql: query, bigNumberStrings: true }, params).then(() => undefined)
    }
    executeFunction(query: string, params: any[]): Promise<any> {
        return this.connection.query({ sql: query, rowsAsArray: true, bigNumberStrings: true }, params).then((result: any[][]) => {
            if (result.length > 1) {
                throw new Error('Too many rows, expected only zero or one row')
            }
            const row = result[0]
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
        return this.connection.beginTransaction()
    }
    executeCommit(): Promise<void> {
        return this.connection.commit()
    }
    executeRollback(): Promise<void> {
        return this.connection.rollback()
    }
    addParam(params: any[], value: any): string {
        params.push(value)
        return '?'
    }
    addOutParam(_params: any[], _name: string): string {
        throw new Error('Unsupported output parameters')
    }
}