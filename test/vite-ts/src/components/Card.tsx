import { Box, BoxProps, forwardRef } from '@chakra-ui/react';

export const Card = forwardRef<BoxProps, 'div'>((props, ref) => {
    return (
        <Box
            ref={ref}
            borderRadius="xl"
            boxShadow="0 2px 10px 2px hsla(0, 0%, 10%, 0.15)"
            mb={6}
            p={4}
            overflow="hidden"
            {...props}
        />
    );
});
