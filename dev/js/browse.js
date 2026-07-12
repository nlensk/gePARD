function createGenomeCard(genome) {

    const card = document.createElement("div");

    card.className = "genome-card";

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

document.addEventListener("DOMContentLoaded", async () => {

    await database.load("../data/genomes.json");

    const genomes = database.getAllGenomes();

    const stats = database.getStatistics();

    console.log(stats);

    updateGenomeCount(stats);

    displayGenomes(genomes);

});