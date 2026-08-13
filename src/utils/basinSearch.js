let basinIDs = [];


export async function loadBasinSearchIndex() {

    const response =
        await fetch("/basin_index.json");

    if (!response.ok) {
        throw new Error(
            "Unable to load basin search index."
        );
    }

    const bounds =
        await response.json();

    basinIDs =
        Object.keys(bounds);

    return basinIDs;
}


export function searchBasins(
    query,
    limit = 8
) {

    const normalized =
        query.trim();

    if (!normalized) {
        return [];
    }

    return basinIDs
        .filter(id =>
            id.startsWith(normalized)
        )
        .slice(0, limit);
}