export interface CalculatedQuantiles {
    min: number;
    max: number;
    Q1: number;
    Q3: number;
    Q90: number;
    Q10: number;
}

export const calculateQuartiles = (
    historicalData: number[]
): CalculatedQuantiles | null => {
    if (!historicalData?.length) return null;

    const sorted = [...historicalData].sort((a, b) => a - b);
    const percentile = (arr: number[], p: number) => {
        const index = (arr.length - 1) * p;
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        return arr[lower] + (arr[upper] - arr[lower]) * (index - lower);
    };

    return {
        min: sorted[0],
        max: sorted[sorted.length - 1],
        Q1: percentile(sorted, 0.25),
        Q3: percentile(sorted, 0.75),
        Q10: percentile(sorted, 0.1),
        Q90: percentile(sorted, 0.9),
    };
};

export const getDecimalsCount = (value: string | number): number => {
    const valueStr: string = value.toString();
    if (!valueStr.includes('.')) return 0;
    return valueStr.split('.')[1].length;
};
