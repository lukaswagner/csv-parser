import { Button, Flex, Spacer, Text } from '@chakra-ui/react';
import conf from '@csv-parser/data/conf.json';
import { useResetRecoilState, useSetRecoilState } from 'recoil';

import {
    columnHeadersState,
    columnsState,
    dataSourceState,
    inputDataState,
    inputTypeState,
    statisticsState,
} from '../store/app';

export const Header = (): JSX.Element => {
    const setDataSource = useSetRecoilState(dataSourceState);
    const setInputData = useSetRecoilState(inputDataState);

    const resetDataSource = useResetRecoilState(dataSourceState);
    const resetInputData = useResetRecoilState(inputDataState);
    const resetInputType = useResetRecoilState(inputTypeState);
    const resetColumnHeaders = useResetRecoilState(columnHeadersState);
    const resetColumns = useResetRecoilState(columnsState);
    const resetStatistics = useResetRecoilState(statisticsState);

    const handleRemoteUrlClick = (): void => {
        handleResetClick();

        setTimeout(() => {
            setDataSource('remote');
            setInputData({
                url: conf.url,
                shouldPrefetch: false,
            });
        });
    };

    const handleGoogleSheetClick = (): void => {
        handleResetClick();

        setTimeout(() => {
            setDataSource('google-sheets');
            setInputData({
                apiKey: import.meta.env.VITE_API_KEY,
                sheetId: import.meta.env.VITE_SHEET_ID,
            });
        });
    };

    const handleResetClick = (): void => {
        resetDataSource();
        resetInputData();
        resetInputType();
        resetColumnHeaders();
        resetColumns();
        resetStatistics();
    };

    return (
        <Flex as="header" alignItems="center" gap={4} p={6} w="100%">
            <Text fontSize="lg" fontWeight={500}>
                Test Cases:
            </Text>
            {conf.url ? <Button onClick={handleRemoteUrlClick}>Remote URL</Button> : null}

            {import.meta.env.VITE_API_KEY && import.meta.env.VITE_SHEET_ID ? (
                <Button onClick={handleGoogleSheetClick}>Google Sheet</Button>
            ) : null}
            <Spacer />
            <Button colorScheme="gray" onClick={handleResetClick}>
                Reset
            </Button>
        </Flex>
    );
};
