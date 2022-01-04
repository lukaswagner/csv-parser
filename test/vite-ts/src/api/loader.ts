import { CSV } from 'csv-parser';

export const loader = new CSV({
    delimiter: ',',
    includesHeader: true,
});
