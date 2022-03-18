import React, { useEffect, useState } from 'react';
import { Box, Button, Center, Spinner, Stack } from '@chakra-ui/react';
import { ColumnHeader, DataType } from '@lukaswagner/csv-parser';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { loader } from '../api/loader';
import {
    columnHeadersState,
    DataSource,
    dataSourceState,
    InputData,
    inputDataState,
    inputIdState,
    inputTypeState,
    isOpenerDisabledState,
} from '../store/app';
import { isRemote } from '../utils/datasources';
import { Card } from './Card';
import { DataTypeSelect } from './DataTypeSelect';

const isLocal = (dataSource: DataSource, inputData: InputData): inputData is File =>
    dataSource === 'local';

const useOpenCsv = (): [() => Promise<ColumnHeader[]>, boolean] => {
    const dataSource = useRecoilValue(dataSourceState);
    const inputData = useRecoilValue(inputDataState);
    const inputType = useRecoilValue(inputTypeState);
    const inputId = useRecoilValue(inputIdState);
    const setColumnHeaders = useSetRecoilState(columnHeadersState);
    const [isLoading, setIsLoading] = useState(false);

    const openCsv = async (): Promise<ColumnHeader[]> => {
        setIsLoading(true);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let input: any;

        if (!dataSource || !inputData || !inputId) {
            throw new Error();
        }

        if (isLocal(dataSource, inputData)) {
            switch (inputType) {
                case 'blob':
                case 'file':
                    input = inputData;
                    break;

                case 'buffer':
                    input = inputData.arrayBuffer();
                    break;

                case 'uint8array':
                    input = new Uint8Array(await inputData.arrayBuffer());
                    break;

                case 'stream':
                    input = inputData.stream();
                    break;

                default:
            }
        } else if (isRemote(inputData)) {
            if (inputData.shouldPrefetch) {
                switch (inputType) {
                    case 'blob':
                    case 'file':
                        input = () => fetch(inputData.url).then((r) => r.blob());
                        break;

                    case 'buffer':
                        input = () => fetch(inputData.url).then((r) => r.arrayBuffer());
                        break;

                    case 'uint8array':
                        input = () =>
                            fetch(inputData.url)
                                .then((r) => r.arrayBuffer())
                                .then((b) => new Uint8Array(b));
                        break;

                    case 'stream':
                        input = () => fetch(inputData.url).then((r) => r.body);
                        break;

                    default:
                }
            } else {
                input = inputData.url;
            }
        } else {
            input = inputData;
        }

        loader.addDataSource(inputId, input);

        const columns = await loader.open(inputId);

        console.log({ columns });

        setColumnHeaders(columns);
        setIsLoading(false);

        return columns.map((col) => ({ ...col }));
    };

    return [openCsv, isLoading];
};

export const DataSourceOpener = (): JSX.Element => {
    const [openCsv, isLoading] = useOpenCsv();
    const isDisabled = useRecoilValue(isOpenerDisabledState);
    const [columns, setColumns] = useState<ColumnHeader[]>([]);
    const [originalColumns, setOriginalColumns] = useState<ColumnHeader[]>([]);
    const [showCard, setShowCard] = useState(false);

    useEffect(() => {
        if (isDisabled) {
            setShowCard(false);
            setColumns([]);
            setOriginalColumns([]);
        }
    }, [isDisabled]);

    const handleOpenClick = async (): Promise<void> => {
        setShowCard(true);

        const detectedColumns = await openCsv();

        console.log(detectedColumns);

        setColumns(detectedColumns);
        setOriginalColumns(detectedColumns.map((col) => ({ ...col })));
    };

    const handleDataTypeChange =
        (index: number) => (event: React.ChangeEvent<HTMLSelectElement>) => {
            setColumns((currVal) => {
                const newVal = [...currVal];

                newVal[index].type = event.target.value as DataType;

                return newVal;
            });
        };

    const handleResetClick = (): void => {
        setColumns([...originalColumns.map((col) => ({ ...col }))]);
    };

    return (
        <Stack gap={4}>
            <Button isDisabled={isDisabled} onClick={handleOpenClick}>
                Open CSV file
            </Button>
            {showCard ? (
                <Card>
                    {isLoading ? (
                        <Center>
                            <Spinner size="lg" />
                        </Center>
                    ) : (
                        <Stack gap={2}>
                            <Box display="flex" justifyContent="end">
                                <Button
                                    aria-label="Reset column headers"
                                    colorScheme="gray"
                                    onClick={handleResetClick}
                                >
                                    Reset
                                </Button>
                            </Box>
                            {columns.map((column, index) => (
                                <DataTypeSelect
                                    key={column.name}
                                    label={column.name}
                                    onChange={handleDataTypeChange(index)}
                                    value={column.type}
                                />
                            ))}
                        </Stack>
                    )}
                </Card>
            ) : null}
        </Stack>
    );
};
