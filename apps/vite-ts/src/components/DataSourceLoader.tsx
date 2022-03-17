import { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Center,
    Spinner,
    Stack,
    Table,
    Tbody,
    Td,
    Text,
    Thead,
    Tr,
} from '@chakra-ui/react';
import { DataType, NumberColumn } from '@lukaswagner/csv-parser';
import { useRecoilState, useRecoilValue } from 'recoil';

import { loader } from '../api/loader';
import {
    columnHeadersState,
    columnsState,
    elapsedTimeState,
    isLoaderDisabledState,
    statisticsState,
} from '../store/app';
import { Card } from './Card';

export const DataSourceLoader = (): JSX.Element => {
    const isDisabled = useRecoilValue(isLoaderDisabledState);
    const columnHeaders = useRecoilValue(columnHeadersState);
    const [columns, setColumns] = useRecoilState(columnsState);
    const [statistics, setStatistics] = useRecoilState(statisticsState);
    const elapsedTime = useRecoilValue(elapsedTimeState);
    const [showCard, setShowCard] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isDisabled) {
            setShowCard(false);
        }
    }, [isDisabled]);

    const handleLoadClick = async (): Promise<void> => {
        setIsLoading(true);
        setShowCard(true);

        const { columns: resultColumns, statistics } = await loader.load({
            columns: columnHeaders,
        });

        console.log({ resultColumns, statistics });

        setColumns(resultColumns);
        setStatistics(statistics);

        setIsLoading(false);
    };

    return (
        <Stack gap={4}>
            <Button isDisabled={isDisabled} onClick={handleLoadClick}>
                Load CSV data
            </Button>
            {showCard ? (
                <Card maxH="75vh" overflowY="auto">
                    {isLoading ? (
                        <Center>
                            <Spinner size="lg" />
                        </Center>
                    ) : (
                        <Stack gap={2}>
                            <Box>
                                <Text fontWeight={600}>Column statistics</Text>
                                <Table size="sm" variant="striped">
                                    <Thead>
                                        <Tr>
                                            <Td>Name</Td>
                                            <Td isNumeric>Row count</Td>
                                            <Td isNumeric>Minimum</Td>
                                            <Td isNumeric>Maximum</Td>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {columns.map((column) => (
                                            <Tr key={column.name}>
                                                <Td>{column.name}</Td>
                                                <Td isNumeric>{column.length}</Td>
                                                <Td isNumeric>
                                                    {column.type === DataType.Number
                                                        ? (column as NumberColumn).min
                                                        : '-'}
                                                </Td>
                                                <Td isNumeric>
                                                    {column.type === DataType.Number
                                                        ? (column as NumberColumn).max
                                                        : '-'}
                                                </Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            </Box>
                            {statistics && elapsedTime ? (
                                <Box>
                                    <Text fontWeight={600} mb={1}>
                                        Loader statistics
                                    </Text>
                                    <Table size="sm" variant="striped">
                                        <Tbody>
                                            <Tr>
                                                <Td>source bytes</Td>
                                                <Td isNumeric>{statistics.bytes}</Td>
                                            </Tr>
                                            <Tr>
                                                <Td>source chunks</Td>
                                                <Td isNumeric>{statistics.chunks}</Td>
                                            </Tr>
                                            <Tr>
                                                <Td>number of workers</Td>
                                                <Td isNumeric>{statistics.workers}</Td>
                                            </Tr>
                                            <Tr>
                                                <Td>read rows</Td>
                                                <Td isNumeric>{columns[0].length}</Td>
                                            </Tr>
                                            <Tr>
                                                <Td>kB / worker</Td>
                                                <Td isNumeric>
                                                    {(
                                                        statistics.bytes /
                                                        1000 /
                                                        statistics.workers
                                                    ).toFixed(3)}
                                                </Td>
                                            </Tr>
                                            <Tr>
                                                <Td>chunks / worker</Td>
                                                <Td isNumeric>
                                                    {(
                                                        statistics.chunks / statistics.workers
                                                    ).toFixed(3)}
                                                </Td>
                                            </Tr>
                                            <Tr>
                                                <Td>total time in s</Td>
                                                <Td isNumeric>{elapsedTime.toFixed(3)}</Td>
                                            </Tr>
                                            <Tr>
                                                <Td>kB / s</Td>
                                                <Td isNumeric>
                                                    {(
                                                        statistics.bytes /
                                                        1000 /
                                                        elapsedTime
                                                    ).toFixed(3)}
                                                </Td>
                                            </Tr>
                                            <Tr>
                                                <Td>kRows / s</Td>
                                                <Td isNumeric>
                                                    {(
                                                        columns[0].length /
                                                        1000 /
                                                        elapsedTime
                                                    ).toFixed(3)}
                                                </Td>
                                            </Tr>
                                        </Tbody>
                                    </Table>
                                </Box>
                            ) : null}

                            <Box>
                                <Text fontWeight={600} mb={1}>
                                    Performance statistics
                                </Text>
                                <Table size="sm" variant="striped">
                                    <Tbody>
                                        {statistics?.performance.map((measure) => (
                                            <Tr key={measure.label}>
                                                <Td>{measure.label}</Td>
                                                <Td isNumeric>{measure.delta} ms</Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            </Box>
                        </Stack>
                    )}
                </Card>
            ) : null}
        </Stack>
    );
};
