import { ColorChunk } from '../chunk/colorChunk';
import { DataType } from '../dataType';
import { vec4 } from '../tuples';
import { BaseColumn } from './baseColumn';

export class ColorColumn extends BaseColumn<vec4, ColorChunk> {
    public constructor(name: string) {
        super(name, DataType.Color);
    }
}
