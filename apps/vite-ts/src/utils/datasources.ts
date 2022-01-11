import type { InputData, Remote, Sheet } from '../store/app';

export const isRemote = (data: InputData | undefined): data is Remote =>
    typeof data === 'object' && 'url' in data;

export const isSheet = (data: InputData | undefined): data is Sheet =>
    typeof data === 'object' && 'sheetId' in data;
