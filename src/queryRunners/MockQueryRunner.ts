import { QueryRunner, DatabaseType } from "./QueryRunner"

export type QueryType = 'selectOneRow' | 'selectManyRows' | 'selectOneColumnOneRow' | 'selectOneColumnManyRows' | 'insert' | 'insertReturningLastInsertedId' | 'update' | 'delete' | 'executeProcedure' | 'executeFunction' | 'beginTransaction' | 'commit' | 'rollback'

export type QueryExecutor = (type: QueryType, query: string, params: any[], index: number) => any

export class MockQueryRunner implements QueryRunner {
    private count = 0
    readonly queryExecutor: QueryExecutor

    // Supported databases
    readonly mariaDB: true = true
    readonly mySql: true = true
    readonly noopDB: true = true
    readonly oracle: true = true
    readonly postgreSql: true = true
    readonly sqlite: true = true
    readonly sqlServer: true = true
    readonly database: DatabaseType

    constructor(queryExecutor: QueryExecutor, database: DatabaseType = 'noopDB') {
        this.queryExecutor = queryExecutor
        this.database = database
    }

    getNativeConnection(): unknown {
        return null
    }

    executeSelectOneRow(query: string, params: any[]): Promise<any> {
        try {
            return Promise.resolve(this.queryExecutor('selectOneRow', query, params, this.count++))
        } catch (e) {
            return Promise.reject(e)
        }
    }
    executeSelectManyRows(query: string, params: any[]): Promise<any[]> {
        try {
            return Promise.resolve(this.queryExecutor('selectManyRows', query, params, this.count++) || [])
        } catch (e) {
            return Promise.reject(e)
        }
    }
    executeSelectOneColumnOneRow(query: string, params: any[]): Promise<any> {
        try {
            return Promise.resolve(this.queryExecutor('selectOneColumnOneRow', query, params, this.count++))
        } catch (e) {
            return Promise.reject(e)
        }
    }
    executeSelectOneColumnManyRows(query: string, params: any[]): Promise<any[]> {
        try {
            return Promise.resolve(this.queryExecutor('selectOneColumnManyRows', query, params, this.count++) || [])
        } catch (e) {
            return Promise.reject(e)
        }
    }
    executeInsert(query: string, params: any[]): Promise<number> {
        try {
            return Promise.resolve(this.queryExecutor('insert', query, params, this.count++))
        } catch (e) {
            return Promise.reject(e)
        }
    }
    executeInsertReturningLastInsertedId(query: string, params: any[]): Promise<any> {
        try {
            return Promise.resolve(this.queryExecutor('insertReturningLastInsertedId', query, params, this.count++))
        } catch (e) {
            return Promise.reject(e)
        }
    }
    executeUpdate(query: string, params: any[]): Promise<number> {
        try {
            return Promise.resolve(this.queryExecutor('update', query, params, this.count++))
        } catch (e) {
            return Promise.reject(e)
        }
    }
    executeDelete(query: string, params: any[]): Promise<number> {
        try {
            return Promise.resolve(this.queryExecutor('delete', query, params, this.count++))
        } catch (e) {
            return Promise.reject(e)
        }
    }
    executeProcedure(query: string, params: any[]): Promise<void> {
        try {
            return Promise.resolve(this.queryExecutor('executeProcedure', query, params, this.count++))
        } catch (e) {
            return Promise.reject(e)
        }
    }
    executeFunction(query: string, params: any[]): Promise<any> {
        try {
            return Promise.resolve(this.queryExecutor('executeFunction', query, params, this.count++))
        } catch (e) {
            return Promise.reject(e)
        }
    }
    executeBeginTransaction(): Promise<void> {
        try {
            return Promise.resolve(this.queryExecutor('beginTransaction', 'begin transaction', [], this.count++))
        } catch (e) {
            return Promise.reject(e)
        }
    }
    executeCommit(): Promise<void> {
        try {
            return Promise.resolve(this.queryExecutor('commit', 'commit', [], this.count++))
        } catch (e) {
            return Promise.reject(e)
        }
    }
    executeRollback(): Promise<void> {
        try {
            return Promise.resolve(this.queryExecutor('rollback', 'rollback', [], this.count++))
        } catch (e) {
            return Promise.reject(e)
        }
    }
    addParam(params: any[], value: any): string {
        const index = params.length
        let result
        switch (this.database) {
            case 'mariaDB':
                result = '?'
                break
            case 'mySql':
                result = '?'
                break
            case 'noopDB':
                result = '$' + index
                break
            case 'oracle':
                result = ':' + index
                break
            case 'postgreSql':
                result = '$' + (index + 1)
                break
            case 'sqlite':
                result = '$' + index
                break
            case 'sqlServer':
                result = '@' + index
                break
            default:
                throw new Error('Unknown database ' + this.database)
        }
        params.push(value)
        return result
    }
    addOutParam(params: any[], name: string): string {
        const index = params.length
        params.push({out_param_with_name: name})
        return ':' + index
    }

}