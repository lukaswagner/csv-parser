import { DataType } from "../dataType";
import { vec4 } from "../tuples";
import { BaseColumn } from "./baseColumn";

export class ColorColumn extends BaseColumn<vec4> {
    public constructor(name: string) {
        super(name, DataType.Color);
    }
}
