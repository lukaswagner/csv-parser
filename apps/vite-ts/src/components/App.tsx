import { Box } from '@chakra-ui/react';

import { DataSourceLoader } from './DataSourceLoader';
import { DataSourceOpener } from './DataSourceOpener';
import { DataSourceSelect } from './DataSourceSelect';
import { Header } from './Header';
import { InputTypeSelect } from './InputTypeSelect';

export const App = (): JSX.Element => {
    return (
        <Box
            sx={{
                blockSize: '100vh',
                inlineSize: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
        >
            <Header />
            <Box
                as="main"
                sx={{
                    display: 'grid',
                    gap: 10,
                    gridTemplateColumns: '3fr 1fr 2fr 2fr',
                    justifyContent: 'center',
                    p: 16,
                    pt: 2,
                    inlineSize: 'clamp(400px, 100%, 1600px)',
                }}
            >
                <DataSourceSelect />
                <InputTypeSelect />
                <DataSourceOpener />
                <DataSourceLoader />
            </Box>
        </Box>
    );
};
