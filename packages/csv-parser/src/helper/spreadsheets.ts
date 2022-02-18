import type { SheetType } from '../types/dataSource';

export function parseSheetId(sheetUrl: string): { type: SheetType; sheetId: string } {
    const url = new URL(sheetUrl);
    let type: SheetType;
    let sheetId: string;

    switch (url.host) {
        case 'docs.google.com':
            type = 'google';
            // Getting ID out of /spreadsheets/d/<sheet-id>/edit
            [, , , sheetId] = url.pathname.split('/');
            break;

        case 'onedrive.live.com':
            type = 'excel';
            sheetId = url.searchParams.get('resid');
            break;

        default:
            throw new Error('Invalid url for spreadsheet service');
    }

    return { type, sheetId };
}

export * as google from './google-sheets';
export * as excel from './excel-sheets';
