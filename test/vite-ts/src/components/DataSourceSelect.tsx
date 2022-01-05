import React, { useRef } from 'react';
import { LinkIcon, ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import {
    Button,
    Checkbox,
    IconButton,
    Input,
    InputGroup,
    InputLeftAddon,
    InputRightElement,
    RadioGroup,
    Text,
    useBoolean,
} from '@chakra-ui/react';
import { useRecoilState } from 'recoil';

import { type DataSource, dataSourceState, inputDataState } from '../store/app';
import { isRemote, isSheet } from '../utils/datasources';
import { FileIcon } from './icons/FileIcon';
import { KeyIcon } from './icons/KeyIcon';
import { SheetIcon } from './icons/SheetIcon';
import { SelectionCard } from './SelectionCard';

export const DataSourceSelect = (): JSX.Element => {
    const fileInput = useRef<HTMLInputElement>(null);
    const [dataSource, setDataSource] = useRecoilState(dataSourceState);
    const [inputData, setInputData] = useRecoilState(inputDataState);
    const [showApiKey, setShowApiKey] = useBoolean();

    const handleDataSourceSelect = (value: string): void => {
        setDataSource(value as DataSource);
    };

    const handleOpenFileClick = async (): Promise<void> => {
        if ('showOpenFilePicker' in window) {
            try {
                const [fileHandle] = await window.showOpenFilePicker({
                    multiple: false,
                    types: [{ accept: { 'text/csv': ['.csv'] }, description: 'CSV Files' }],
                    excludeAcceptAllOption: true,
                });
                const file = await fileHandle.getFile();

                setInputData(file);
            } catch (error) {
                console.info('File selection aborted');
            }
        } else {
            fileInput.current?.click();
        }
    };

    const handleFileInputChange = (): void => {
        const file = fileInput.current?.files?.item(0);

        if (file) {
            setInputData(file);
        }
    };

    const handleRemoteUrlChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setInputData((currVal) => ({
            url: event.target.value,
            shouldPrefetch: isRemote(currVal) ? currVal.shouldPrefetch : false,
        }));
    };

    const handleRemotePrefetchChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setInputData((currVal) => ({
            url: isRemote(currVal) ? currVal.url : '',
            shouldPrefetch: event.target.checked,
        }));
    };

    const handleSheetsApiKeyChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setInputData((currVal) => ({
            apiKey: event.target.value,
            sheetId: isSheet(currVal) ? currVal.sheetId : '',
        }));
    };

    const handleSheetsSheetIdChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setInputData((currVal) => ({
            apiKey: isSheet(currVal) ? currVal.apiKey : '',
            sheetId: event.target.value,
        }));
    };

    return (
        <RadioGroup onChange={handleDataSourceSelect} value={dataSource}>
            <SelectionCard
                isChecked={dataSource === 'local'}
                onClick={handleDataSourceSelect}
                title="Local"
                value="local"
            >
                <Button colorScheme="gray" leftIcon={<FileIcon />} onClick={handleOpenFileClick}>
                    Open file
                </Button>
                <Input
                    ref={fileInput}
                    accept="text/csv"
                    multiple={false}
                    display="none"
                    onChange={handleFileInputChange}
                    type="file"
                />
                {inputData instanceof File ? <Text>Opened file: {inputData.name}</Text> : null}
            </SelectionCard>
            <SelectionCard
                isChecked={dataSource === 'remote'}
                onClick={handleDataSourceSelect}
                title="Remote"
                value="remote"
            >
                <InputGroup>
                    <InputLeftAddon>
                        <LinkIcon />
                    </InputLeftAddon>
                    <Input
                        onChange={handleRemoteUrlChange}
                        placeholder="URL"
                        type="url"
                        value={isRemote(inputData) ? inputData.url : ''}
                    />
                </InputGroup>
                <Checkbox
                    onChange={handleRemotePrefetchChange}
                    isChecked={isRemote(inputData) ? inputData.shouldPrefetch : false}
                >
                    Prefetch data
                </Checkbox>
            </SelectionCard>
            <SelectionCard
                isChecked={dataSource === 'google-sheets'}
                onClick={handleDataSourceSelect}
                title="Google Sheets"
                value="google-sheets"
            >
                <InputGroup>
                    <InputLeftAddon>
                        <KeyIcon />
                    </InputLeftAddon>
                    <Input
                        onChange={handleSheetsApiKeyChange}
                        placeholder="API Key"
                        type={showApiKey ? 'text' : 'password'}
                        value={isSheet(inputData) ? inputData.apiKey : ''}
                    />
                    <InputRightElement>
                        <IconButton
                            aria-label="Show API key"
                            colorScheme="gray"
                            icon={showApiKey ? <ViewOffIcon /> : <ViewIcon />}
                            onClick={setShowApiKey.toggle}
                            variant="ghost"
                        />
                    </InputRightElement>
                </InputGroup>
                <InputGroup>
                    <InputLeftAddon>
                        <SheetIcon />
                    </InputLeftAddon>
                    <Input
                        onChange={handleSheetsSheetIdChange}
                        placeholder="Sheet ID"
                        type="text"
                        value={isSheet(inputData) ? inputData.sheetId : ''}
                    />
                </InputGroup>
            </SelectionCard>
        </RadioGroup>
    );
};
