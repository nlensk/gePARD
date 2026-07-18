let currentGenomes = [];

function createGenomeCard(genome) {

    const card = document.createElement("div");

    card.className = "genome-card";

    card.style.cursor = "pointer";

    card.addEventListener("click", () => {

        window.location.href =
            `genome.html?accession=${genome.accession}`;

    });

    card.innerHTML = `
        <h2>${genome.name}</h2>

        <p><strong>Accession:</strong> ${genome.accession}</p>

        <p><strong>Host:</strong> ${genome.host}</p>

        <p><strong>Genome Length:</strong>
        ${genome.metadata.length.toLocaleString()} bp</p>

        <p><strong>Protein Hits:</strong>
        ${genome.analysis.proteinHits}</p>

        <p><strong>Nucleotide Hits:</strong>
        ${genome.analysis.nucleotideHits}</p>
    `;

    return card;

}

function displayGenomes(genomes) {

    const container =
        document.getElementById("genomeContainer");

    container.innerHTML = "";

    if (genomes.length === 0) {

        displayEmptyState();

        return;

    }

    for (const genome of genomes) {

        const card = createGenomeCard(genome);

        container.appendChild(card);

    }

}

function displayEmptyState() {

    const container =
        document.getElementById("genomeContainer");

    const emptyState =
        document.createElement("div");

    emptyState.className = "empty-results";

    const heading =
        document.createElement("h2");

    heading.textContent =
        "No genomes matched your search";

    const message =
        document.createElement("p");

    message.textContent =
        "Try changing the search term or resistance-status filter.";

    const clearButton =
        document.createElement("button");

    clearButton.type = "button";
    clearButton.className = "clear-search-button";
    clearButton.textContent = "Clear Search";

    clearButton.addEventListener("click", () => {

        const searchInput =
            document.getElementById("searchInput");

        searchInput.value = "";

        document.title =
            "Browse Genomes | PARD";

        applyBrowseState();

        searchInput.focus();

    });

    emptyState.appendChild(heading);
    emptyState.appendChild(message);
    emptyState.appendChild(clearButton);

    container.appendChild(emptyState);

}

function searchGenomes(genomes, query) {

    const normalizedQuery = query
        .trim()
        .toLowerCase();

    if (normalizedQuery === "") {
        return [...genomes];
    }

    return genomes.filter(genome => {

        const searchableFields = [
            genome.name,
            genome.accession,
            genome.host,
            genome.hostGenus,
            genome.taxonomy
        ];

        return searchableFields.some(field => {

            return String(field ?? "")
                .toLowerCase()
                .includes(normalizedQuery);

        });

    });

}

function filterGenomesByHitStatus(genomes, filterOption) {

    if (filterOption === "all") {
        return [...genomes];
    }

    return genomes.filter(genome => {

        const analysis = genome.analysis ?? {};

        const proteinHits =
            analysis.proteinHits ?? 0;

        const nucleotideHits =
            analysis.nucleotideHits ?? 0;

        const highConfidenceProteinHits =
            analysis.highConfidenceProteinHits ?? 0;

        const highConfidenceNucleotideHits =
            analysis.highConfidenceNucleotideHits ?? 0;

        if (filterOption === "anyHits") {

            return proteinHits > 0 ||
                nucleotideHits > 0;

        }

        if (filterOption === "proteinHits") {

            return proteinHits > 0;

        }

        if (filterOption === "nucleotideHits") {

            return nucleotideHits > 0;

        }

        if (filterOption === "highConfidence") {

            return highConfidenceProteinHits > 0 ||
                highConfidenceNucleotideHits > 0;

        }

        if (filterOption === "noHits") {

            return proteinHits === 0 &&
                nucleotideHits === 0;

        }

        return true;

    });

}

function getSearchQueryFromUrl() {

    const parameters =
        new URLSearchParams(window.location.search);

    return parameters.get("search") ?? "";

}

function updateGenomeCount(visibleCount, totalCount) {

    const countElement =
        document.getElementById("genomeCount");

    if (visibleCount === totalCount) {

        countElement.textContent =
            `Showing all ${totalCount.toLocaleString()} genomes`;

        return;

    }

    countElement.textContent =
        `Showing ${visibleCount.toLocaleString()} of ` +
        `${totalCount.toLocaleString()} genomes`;

}

function sortGenomes(genomes, sortOption) {
    const sorted = [...genomes];
    const compare = sortFunctions[sortOption];

    if (compare) {
        sorted.sort(compare);
    }

    return sorted;
}

function applyBrowseState() {

    const searchInput =
        document.getElementById("searchInput");

    const hitFilter =
        document.getElementById("hitFilter");

    const sortSelect =
        document.getElementById("sortSelect");

    const searchQuery =
        searchInput.value;

    const hitFilterOption =
        hitFilter.value;

    const sortOption =
        sortSelect.value;

    const matchingGenomes =
        searchGenomes(
            currentGenomes,
            searchQuery
        );

    const filteredGenomes =
        filterGenomesByHitStatus(
            matchingGenomes,
            hitFilterOption
        );

    const sortedGenomes =
        sortGenomes(
            filteredGenomes,
            sortOption
        );

    updateGenomeCount(
        filteredGenomes.length,
        currentGenomes.length
    );

    displayGenomes(sortedGenomes);

}

document.addEventListener("DOMContentLoaded", async () => {

    await database.load("../data/genomes.json");

    const genomes = database.getAllGenomes();

    currentGenomes = [...genomes];

    const stats = database.getStatistics();

    const sortSelect = document.getElementById("sortSelect");

    const searchInput =
        document.getElementById("searchInput");

    const hitFilter =
        document.getElementById("hitFilter");

    const initialSearchQuery =
        getSearchQueryFromUrl();

    searchInput.value = initialSearchQuery;

    if (initialSearchQuery) {
        document.title =
            `Search: ${initialSearchQuery} | PARD`;
    }

    sortSelect.addEventListener("change", () => {

        applyBrowseState();

    });

    searchInput.addEventListener("input", () => {

        applyBrowseState();

    });

    hitFilter.addEventListener("change", () => {

        applyBrowseState();

    });

    console.log(stats);

    applyBrowseState();

});

const sortFunctions = {
    nameAsc: (a, b) => a.name.localeCompare(b.name),
    nameDesc: (a, b) => b.name.localeCompare(a.name),

    lengthDesc:
        (a, b) => b.metadata.length - a.metadata.length,

    lengthAsc:
        (a, b) => a.metadata.length - b.metadata.length,

    proteinDesc:
        (a, b) =>
            b.analysis.proteinHits -
            a.analysis.proteinHits,

    nucleotideDesc:
        (a, b) =>
            b.analysis.nucleotideHits -
            a.analysis.nucleotideHits
};