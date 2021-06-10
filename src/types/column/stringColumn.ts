import { BaseColumn } from './baseColumn';
import { DataType } from '../dataType';
import { StringChunk } from '../chunk/stringChunk';

export class StringColumn extends BaseColumn<string, StringChunk> {
    public constructor(name: string) {
        super(name, DataType.String);
    }
}
