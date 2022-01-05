import React from 'react';
import ReactDOM from 'react-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { RecoilRoot } from 'recoil';

import { App } from './components/App';
import { theme } from './styles/theme';

ReactDOM.render(
    <React.StrictMode>
        <RecoilRoot>
            <ChakraProvider theme={theme}>
                <App />
            </ChakraProvider>
        </RecoilRoot>
    </React.StrictMode>,
    document.getElementById('root')
);
