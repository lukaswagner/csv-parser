import { CSV } from '@lukaswasgner/csv-parser';

export const loader = new CSV({
    delimiter: ',',
    includesHeader: true,
});
