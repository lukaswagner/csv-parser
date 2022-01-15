import { CSV } from '@lukaswagner/csv-parser';

export const loader = new CSV({
    delimiter: ',',
    includesHeader: true,
});
