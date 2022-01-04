import type { Column, ColumnHeader, LoadStatistics } from 'csv-parser';
import { atom, selector } from 'recoil';

import { isRemote, isSheet } from '../utils/datasources';

export type DataSource = 'local' | 'remote' | 'google-sheets';

export type Remote = { url: string; shouldPrefetch: boolean };

export type Sheet = { apiKey: string; sheetId: string };

export type InputData = File | Remote | Sheet;

export type InputType = 'stream' | 'buffer' | 'file' | 'blob' | 'uint8array';

export const dataSourceState = atom<DataSource | undefined>({
    key: 'dataSource',
    default: undefined,
});

export const inputDataState = atom<InputData | undefined>({
    key: 'inputData',
    default: undefined,
});

export const inputTypeState = atom<InputType | undefined>({
    key: 'inputType',
    default: undefined,
});

export const isInputTypeDisabledState = selector({
    key: 'isInputTypeDisabled',
    get: ({ get }) => {
        const inputData = get(inputDataState);

        return (
            !inputData || (isRemote(inputData) && !inputData.shouldPrefetch) || isSheet(inputData)
        );
    },
});

export const inputIdState = selector({
    key: 'inputId',
    get: ({ get }) => {
        const dataSource = get(dataSourceState);
        const inputType = get(inputTypeState);

        if (!dataSource) {
            return undefined;
        }

        return [dataSource, inputType].join('-');
    },
});

export const isOpenerDisabledState = selector({
    key: 'isOpenerDisabled',
    get: ({ get }) => {
        const dataSource = get(dataSourceState);
        const inputData = get(inputDataState);
        const inputType = get(inputTypeState);
        const requiresType =
            dataSource === 'local' ||
            (dataSource === 'remote' && isRemote(inputData) && inputData.shouldPrefetch);

        return !dataSource || (requiresType && !inputType) || !inputData;
    },
});

export const columnHeadersState = atom<ColumnHeader[]>({
    key: 'columnHeaders',
    default: [],
});

export const columnsState = atom<Column[]>({
    key: 'columns',
    default: [],
});

export const statisticsState = atom<LoadStatistics | undefined>({
    key: 'statistics',
    default: undefined,
});

export const elapsedTimeState = selector({
    key: 'elapsedTime',
    get: ({ get }) => {
        const statistics = get(statisticsState);
        const id = get(inputIdState);

        if (!statistics) {
            return;
        }

        const timeMs =
            (statistics.performance.find((s) => s.label === `${id}-open`)?.delta ?? 0) +
            (statistics.performance.find((s) => s.label === `${id}-load`)?.delta ?? 0);

        return timeMs / 1000;
    },
});

export const isLoaderDisabledState = selector({
    key: 'isLoaderDisabled',
    get: ({ get }) => {
        const columnHeaders = get(columnHeadersState);

        return columnHeaders.length === 0;
    },
});
