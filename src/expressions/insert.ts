import { ColumnsOf, InputTypeOfColumn, ValueSource } from "./values"
import { ITableOrView } from "../utils/ITableOrView"
import { OptionalColumn } from "../utils/OptionalColumn"
import { ColumnWithDefaultValue } from "../utils/ColumnWithDefaultValue"
import { AnyDB } from "../databases/AnyDB"
import { int } from "ts-extended-types"
import { TypeSafeDB } from "../databases/TypeSafeDB"
import { PrimaryKeyAutogeneratedColumn } from "../utils/PrimaryKeyAutogeneratedColumn"

export abstract class InsertExpressionBase<DB extends AnyDB> {
    // @ts-ignore
    protected ___database: DB
}

export abstract class ExecutableInsertReturning<DB extends AnyDB, RESULT> extends InsertExpressionBase<DB> {
    abstract executeInsert(): Promise<RESULT>
    abstract query(): string
    abstract params(): any[]
}

export abstract class ExecutableInsert<DB extends AnyDB, TABLE extends ITableOrView<DB>> extends InsertExpressionBase<DB> {
    abstract executeInsert(this: InsertExpressionBase<TypeSafeDB>): Promise<int>
    abstract executeInsert(): Promise<number>
    abstract query(): string
    abstract params(): any[]
    abstract returningLastInsertedId: ReturningLastInsertedIdType<DB, TABLE>
    // abstract returning(this: ExecutableInsert<NoopDB, any>): boolean
    // abstract returning(this: ExecutableInsert<PostgreSql, any>): boolean
    // abstract returning(this: NotSupportedDB): boolean
}

export abstract class ExecutableInsertExpression<DB extends AnyDB, TABLE extends ITableOrView<DB>> extends ExecutableInsert<DB, TABLE> {
    abstract set(columns: InsertSets<DB, TABLE>): ExecutableInsertExpression<DB, TABLE>
    abstract setIfValue(columns: OptionalInsertSets<DB, TABLE>): ExecutableInsertExpression<DB, TABLE>
    abstract setIfSet(columns: InsertSets<DB, TABLE>): ExecutableInsertExpression<DB, TABLE>
    abstract setIfSetIfValue(columns: OptionalInsertSets<DB, TABLE>): ExecutableInsertExpression<DB, TABLE>
    abstract setIfNotSet(columns: InsertSets<DB, TABLE>): ExecutableInsertExpression<DB, TABLE>
    abstract setIfNotSetIfValue(columns: OptionalInsertSets<DB, TABLE>): ExecutableInsertExpression<DB, TABLE>
    abstract ignoreIfSet(...columns: OptionalColumnsForInsertOf<DB, TABLE>[]): ExecutableInsertExpression<DB, TABLE>
}

export abstract class MissingKeysInsertExpression<DB extends AnyDB, TABLE extends ITableOrView<DB>, MISSING_KEYS> extends InsertExpressionBase<DB> {
    abstract set<COLUMNS extends InsertSets<DB, TABLE>>(columns: COLUMNS): MaybeExecutableInsertExpression<DB, TABLE, Exclude<MISSING_KEYS, keyof COLUMNS>>
    abstract setIfValue<COLUMNS extends OptionalInsertSets<DB, TABLE>>(columns: COLUMNS): MaybeExecutableInsertExpression<DB, TABLE, Exclude<MISSING_KEYS, keyof COLUMNS>>
    abstract setIfSet<COLUMNS extends InsertSets<DB, TABLE>>(columns: COLUMNS): MaybeExecutableInsertExpression<DB, TABLE, Exclude<MISSING_KEYS, keyof COLUMNS>>
    abstract setIfSetIfValue<COLUMNS extends OptionalInsertSets<DB, TABLE>>(columns: COLUMNS): MaybeExecutableInsertExpression<DB, TABLE, Exclude<MISSING_KEYS, keyof COLUMNS>>
    abstract setIfNotSet<COLUMNS extends InsertSets<DB, TABLE>>(columns: COLUMNS): MaybeExecutableInsertExpression<DB, TABLE, Exclude<MISSING_KEYS, keyof COLUMNS>>
    abstract setIfNotSetIfValue<COLUMNS extends OptionalInsertSets<DB, TABLE>>(columns: COLUMNS): MaybeExecutableInsertExpression<DB, TABLE, Exclude<MISSING_KEYS, keyof COLUMNS>>
    abstract ignoreIfSet(...columns: OptionalColumnsForInsertOf<DB, TABLE>[]): MissingKeysInsertExpression<DB, TABLE, MISSING_KEYS>
}

export abstract class InsertExpression<DB extends AnyDB, TABLE extends ITableOrView<DB>> extends InsertExpressionBase<DB> {
    abstract dynamicSet(): MissingKeysInsertExpression<DB, TABLE, keyof RequiredInsertSets<DB, TABLE>>
    abstract set(columns: InsertSets<DB, TABLE> & RequiredInsertSets<DB, TABLE>): ExecutableInsertExpression<DB, TABLE>
    abstract setIfValue(columns: OptionalInsertSets<DB, TABLE> & RequiredInsertSets<DB, TABLE>): ExecutableInsertExpression<DB, TABLE>
    abstract defaultValues: DefaultValueType<DB, TABLE>
}

type ReturningLastInsertedIdType<DB extends AnyDB, TABLE extends ITableOrView<DB>> =
    AutogeneratedPrimaryKeyColumnsTypesOf<DB, TABLE> extends never ? never : () => ExecutableInsertReturning<DB, AutogeneratedPrimaryKeyColumnsTypesOf<DB, TABLE>>

type DefaultValueType<DB extends AnyDB, TABLE extends ITableOrView<DB>> =
    'yes' extends MissingKeys<keyof RequiredInsertSets<DB, TABLE>> ? never : () => ExecutableInsert<DB, TABLE>

type MissingKeys<KEYS> = KEYS extends never ? never : 'yes'
type MaybeExecutableInsertExpression<DB extends AnyDB, TABLE extends ITableOrView<DB>, MISSING_KEYS> = 
    'yes' extends MissingKeys<MISSING_KEYS> ? MissingKeysInsertExpression<DB, TABLE, MISSING_KEYS> : ExecutableInsertExpression<DB, TABLE>

export type InsertSets<DB extends AnyDB, TABLE extends ITableOrView<DB>> = {
    [P in ColumnsOf<DB, TABLE>]?: InputTypeOfColumn<DB, TABLE, P>
}

export type OptionalInsertSets<DB extends AnyDB, TABLE extends ITableOrView<DB>> = {
    [P in ColumnsOf<DB, TABLE>]?: InputTypeOfColumn<DB, TABLE, P> | null | undefined
}

export type RequiredInsertSets<DB extends AnyDB, TABLE extends ITableOrView<DB>> = {
    [P in RequiredColumnsForInsertOf<DB, TABLE>]: InputTypeOfColumn<DB, TABLE, P>
}

export type RequiredColumnsForInsertOf<DB extends AnyDB, T extends ITableOrView<DB>> = (
    { [K in keyof T]-?: T[K] extends ValueSource<DB, T, any> ? (T[K] extends OptionalColumn ? never : (T[K] extends ColumnWithDefaultValue ? never : K)) : never }
)[keyof T]

export type OptionalColumnsForInsertOf<DB extends AnyDB, T extends ITableOrView<DB>> = (
    { [K in keyof T]-?: T[K] extends ValueSource<DB, T, any> ? (T[K] extends OptionalColumn ? K : (T[K] extends ColumnWithDefaultValue ? K : never)) : never }
)[keyof T]

export type AutogeneratedPrimaryKeyColumnsTypesOf<DB extends AnyDB, T extends ITableOrView<DB>> = (
    { [K in keyof T]-?: T[K] extends ValueSource<DB, T, infer TYPE> ? (T[K] extends PrimaryKeyAutogeneratedColumn ? TYPE : never) : never }
)[keyof T]
