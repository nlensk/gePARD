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

function updateGenomeCount(stats) {

    document.getElementById("genomeCount").textContent =
        `${stats.totalGenomes} genomes loaded`;

}

function sortGenomes(genomes, sortOption) {
    const sorted = [...genomes];
    const compare = sortFunctions[sortOption];

    if (compare) {
        sorted.sort(compare);
    }

    return sorted;
}

function refreshDisplay(genomes, sortOption) {

    const sorted = sortGenomes(genomes, sortOption);

    displayGenomes(sorted);

}

document.addEventListener("DOMContentLoaded", async () => {

    await database.load("../data/genomes.json");

    const genomes = database.getAllGenomes();

    currentGenomes = [...genomes];

    const stats = database.getStatistics();

    const sortSelect = document.getElementById("sortSelect");

    sortSelect.addEventListener("change", () => {

        refreshDisplay(currentGenomes, sortSelect.value);

    });

    console.log(stats);

    updateGenomeCount(stats);

    const sorted =
        sortGenomes(genomes, "nameAsc");

    displayGenomes(sorted);

});

const sortFunctions = {
    nameAsc: (a, b) => a.name.localeCompare(b.name),
    nameDesc: (a, b) => b.name.localeCompare(a.name),
    lengthDesc: (a, b) => b.metadata.length - a.metadata.length,
    proteinDesc: (a, b) => b.analysis.proteinHits - a.analysis.proteinHits,
    nucleotideDesc: (a, b) => b.analysis.nucleotideHits - a.analysis.nucleotideHits
};