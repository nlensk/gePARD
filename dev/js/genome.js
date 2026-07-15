function createInfoRow(label, value) {

    return `
        <div class="info-row">
            <span class="info-label">${label}</span>
            <span class="info-value">${value}</span>
        </div>
    `;

}

function displayGenomeOverview(genome) {

    return `

        <section class="genome-section">

            <h3>Genome Overview</h3>

            ${createInfoRow("Accession", genome.accession)}

            ${createInfoRow("Host", genome.host)}

            ${createInfoRow(
                "Genome Length",
                genome.metadata.length.toLocaleString() + " bp"
            )}

        </section>

    `;

}

function renderGenomePage(genome) {

    document.getElementById("genomeContent").innerHTML = `

        ${displayGenomeOverview(genome)}

        ${displayResistanceAnalysis(genome)}

        ${displayGenomeQuality(genome)}

    `;

}

function displayResistanceAnalysis(genome) {

    return `

        <section class="genome-section">

            <h3>Resistance Analysis</h3>

            ${createInfoRow(
                "Protein Hits",
                genome.analysis.proteinHits
            )}

            ${createInfoRow(
                "Nucleotide Hits",
                genome.analysis.nucleotideHits
            )}

        </section>

    `;

}

function displayGenomeQuality(genome) {

    return `

        <section class="genome-section">

            <h3>Genome Quality</h3>

            ${createInfoRow(
                "GC Content",
                genome.metadata.gcContent ?? "Unknown"
            )}

            ${createInfoRow(
                "Ambiguous Bases",
                genome.metadata.ambiguousBases ?? 0
            )}

        </section>

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

    renderGenomePage(genome);

});