import { Box, Select, Text } from '@chakra-ui/react';
import { DataType } from '@lukaswagner/csv-parser';

interface Props {
    label: string;
    onChange: React.ChangeEventHandler<HTMLSelectElement>;
    value: DataType;
}

export const DataTypeSelect = (props: Props): JSX.Element => {
    const { label, onChange, value } = props;

    return (
        <Box>
            <Text fontStyle="italic" fontWeight={600} ml={2}>
                {label}
            </Text>
            <Select onChange={onChange} value={value}>
                <option value={DataType.Number}>Number</option>
                <option value={DataType.Int8}>Int8</option>
                <option value={DataType.Uint8}>Uint8</option>
                <option value={DataType.Int16}>Int16</option>
                <option value={DataType.Uint16}>Uint16</option>
                <option value={DataType.Int32}>Int32</option>
                <option value={DataType.Uint32}>Uint32</option>
                <option value={DataType.Float32}>Float32</option>
                <option value={DataType.Float64}>Float64</option>
                <option value={DataType.Color}>Color</option>
                <option value={DataType.String}>String</option>
            </Select>
        </Box>
    );
};
