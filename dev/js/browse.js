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

    for (const genome of genomes) {

        const card = createGenomeCard(genome);

        container.appendChild(card);

    }

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

function refreshDisplay(genomes, sortOption, searchQuery = "") {

    const matchingGenomes =
        searchGenomes(genomes, searchQuery);

    const sortedGenomes =
        sortGenomes(matchingGenomes, sortOption);

    updateGenomeCount(
        matchingGenomes.length,
        genomes.length
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

    const initialSearchQuery =
        getSearchQueryFromUrl();

    searchInput.value = initialSearchQuery;

    if (initialSearchQuery) {
        document.title =
            `Search: ${initialSearchQuery} | PARD`;
    }

    sortSelect.addEventListener("change", () => {

        refreshDisplay(
            currentGenomes,
            sortSelect.value,
            searchInput.value
        );

    });

    searchInput.addEventListener("input", () => {

        refreshDisplay(
            currentGenomes,
            sortSelect.value,
            searchInput.value
        );

    });

    console.log(stats);

    refreshDisplay(
        currentGenomes,
        sortSelect.value,
        searchInput.value
    );

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