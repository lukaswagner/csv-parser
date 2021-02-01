import { DataType } from "../dataType";
import { BaseColumn } from "./baseColumn";

export class StringColumn extends BaseColumn<string> {
    public constructor(name: string) {
        super(name, DataType.String);
    }
}
