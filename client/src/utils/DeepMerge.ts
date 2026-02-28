export function deepMerge<T>(target: T, patch: Partial<T>): T {
    const result: any = { ...target };

    for (const key in patch) {
        const value = patch[key];

        if (value === undefined) continue;

        if (
            typeof value === "object" &&
            value !== null &&
            !Array.isArray(value)
        ) {
            result[key] = deepMerge(target[key], value);
        } else {
            result[key] = value;
        }
    }

    return result;
}