import { useEffect } from 'react';
import { RadioGroup } from '@chakra-ui/react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { type InputType, inputTypeState, isInputTypeDisabledState } from '../store/app';
import { SelectionCard } from './SelectionCard';

const inputTypes: { title: string; value: InputType }[] = [
    { title: 'Stream', value: 'stream' },
    { title: 'Buffer', value: 'buffer' },
    { title: 'File', value: 'file' },
    { title: 'Blob', value: 'blob' },
    { title: 'Uint8Array', value: 'uint8array' },
];

export const InputTypeSelect = (): JSX.Element => {
    const [inputType, setInputType] = useRecoilState(inputTypeState);
    const isDisabled = useRecoilValue(isInputTypeDisabledState);

    useEffect(() => {
        if (isDisabled) {
            setInputType(undefined);
        }
    }, [isDisabled]);

    const handleInputTypeSelect = (value: string): void => {
        setInputType(value as InputType);
    };

    return (
        <RadioGroup isDisabled={isDisabled} onChange={handleInputTypeSelect} value={inputType}>
            {inputTypes.map(({ title, value }) => (
                <SelectionCard
                    key={`input-type-${value}`}
                    isDisabled={isDisabled}
                    onClick={handleInputTypeSelect}
                    title={title}
                    value={value}
                />
            ))}
        </RadioGroup>
    );
};
