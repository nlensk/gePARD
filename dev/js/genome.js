function createInfoRow(label, value) {

    return `
        <div class="info-row">
            <span class="info-label">${label}</span>
            <span class="info-value">${value}</span>
        </div>
    `;

}

function displayGenomeOverview(genome) {

    document.getElementById("genomeContent").innerHTML = `

        <h3>Genome Overview</h3>

        ${createInfoRow("Accession", genome.accession)}

        ${createInfoRow("Host", genome.host)}

        ${createInfoRow(
            "Genome Length",
            genome.metadata.length.toLocaleString() + " bp"
        )}

        ${createInfoRow(
            "Protein Hits",
            genome.analysis.proteinHits
        )}

    `;

}

document.addEventListener("DOMContentLoaded", async () => {

    await database.load("../data/genomes.json");

    const parameters =
        new URLSearchParams(window.location.search);

    const accession =
        parameters.get("accession");

    const genome =
        database.getGenome(accession);

    document.getElementById("genomeTitle")
        .textContent = genome.name;

    displayGenomeOverview(genome);

});