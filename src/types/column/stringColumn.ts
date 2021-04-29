import { DataType } from "../interface/dataType";
import { StringChunk } from "../chunk/stringChunk";
import { BaseColumn } from "./baseColumn";

export class StringColumn extends BaseColumn<string, StringChunk> {
    public constructor(name: string) {
        super(name, DataType.String);
    }
}
