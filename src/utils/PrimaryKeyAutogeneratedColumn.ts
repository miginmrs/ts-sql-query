import { Column } from "./Column"

export class PrimaryKeyAutogeneratedColumn extends Column {
    // @ts-ignore
    private __isPrimaryKeyAutogenerated: true
}