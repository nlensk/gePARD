function createInfoRow(label, value) {

    return `
        <div class="info-row">
            <div class="info-label">${label}</div>
            <div class="info-value">${value}</div>
        </div>
    `;

}

function displayGenomeOverview(genome) {

    return `

        <section class="genome-section">

            <h3>Genome Overview</h3>

            ${createInfoRow(
                "Genome Name",
                genome.name ?? "Unknown"
            )}

            ${createInfoRow(
                "Accession",
                genome.accession ?? "Unknown"
            )}

            ${createInfoRow(
                "Host",
                genome.host ?? "Unknown"
            )}

            ${createInfoRow(
                "Host Genus",
                genome.hostGenus ?? "Unknown"
            )}

            ${createInfoRow(
                "Taxonomy",
                genome.taxonomy ?? "Unknown"
            )}

            ${createInfoRow(
                "Genome Length",
                genome.metadata?.length != null
                    ? genome.metadata.length.toLocaleString() + " bp"
                    : "Unknown"
            )}

            ${createInfoRow(
                "Gene Count",
                genome.metadata?.geneCount ?? "Unknown"
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

    const gcContent =
        genome.metadata?.gc != null
            ? `${genome.metadata.gc}%`
            : "Unknown";

    return `

        <section class="genome-section">

            <h3>Genome Quality</h3>

            ${createInfoRow(
                "GC Content",
                gcContent
            )}

            ${createInfoRow(
                "Ambiguous Bases",
                genome.metadata?.ambiguousBases ?? "Unknown"
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