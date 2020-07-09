import Column from "./Column";

export default class Table {
    public constructor() {}

    public getColumn(name: string): Column {
        throw new Error("Method not implemented.");
    }

    public getColumns(): Column[] {
        throw new Error("Method not implemented.");
    }

    public getColumnNames(): string[] {
        return this.getColumns().map((column) => column.name);
    }

    public getData(): { [column: string]: any } {
        throw new Error("Method not implemented.");
    }
}
