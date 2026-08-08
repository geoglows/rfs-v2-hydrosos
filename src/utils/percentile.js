export function percentile(values, p) {
    if (values.length === 0) {
        throw new Error("Cannot compute percentile of an empty array.");
    }

    const sortedValues = [...values].sort(
        (a, b) => a - b
    );

    const idx =
        (p / 100) * (sortedValues.length - 1);

    const lower = Math.floor(idx);
    const upper = Math.ceil(idx);

    if (lower === upper) {
        return sortedValues[lower];
    }

    return (
        sortedValues[lower] +
        (sortedValues[upper] - sortedValues[lower]) *
        (idx - lower)
    );
}
