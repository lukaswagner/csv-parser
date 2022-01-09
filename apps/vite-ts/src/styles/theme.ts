import { extendTheme, withDefaultColorScheme } from '@chakra-ui/react';

export const theme = extendTheme(
    {
        styles: {
            global: {
                '::-webkit-scrollbar': {
                    height: 6,
                    width: 6,
                },
                '::-webkit-scrollbar-thumb': {
                    backgroundColor: 'var(--chakra-colors-gray-300)',
                    border: '8px solid transparent',
                    borderRadius: 'full',
                    backgroundClip: 'content-box',
                },
                html: {
                    scrollbarColor: 'var(--chakra-colors-gray-300) transparent',
                    scrollbarWidth: 'thin',
                },
            },
        },
    },
    withDefaultColorScheme({ colorScheme: 'orange' })
);
