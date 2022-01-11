import { Collapse, Radio, Stack, Text } from '@chakra-ui/react';

import { Card } from './Card';

type Props = {
    children?: React.ReactNode;
    isChecked?: boolean;
    isDisabled?: boolean;
    onClick?: (value: string) => void;
    title: string;
    value: string;
};

export const SelectionCard = (props: Props): JSX.Element => {
    const { children, isChecked, isDisabled, onClick, title, value } = props;

    return (
        <Card
            cursor={isDisabled ? 'default' : 'pointer'}
            opacity={isDisabled ? 0.5 : 1}
            transition="transform 150ms ease, box-shadow 150ms ease"
            _hover={{
                ...(!isDisabled && {
                    boxShadow: '0 3px 14px 2px hsla(0, 0%, 10%, 0.20)',
                    transform: 'scale(1.02)',
                }),
            }}
            onClick={isDisabled ? undefined : () => onClick?.(value)}
        >
            <Radio size="lg" value={value}>
                <Text fontSize="xl" fontWeight={300}>
                    {title}
                </Text>
            </Radio>
            <Collapse in={isChecked} animateOpacity>
                <Stack
                    borderColor="gray.100"
                    borderWidth={1}
                    borderRadius="lg"
                    cursor="default"
                    mt={3}
                    p={2}
                    onClick={undefined}
                >
                    {children}
                </Stack>
            </Collapse>
        </Card>
    );
};
