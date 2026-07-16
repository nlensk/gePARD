function createInfoRow(label, value) {

    return `
        <div class="info-row">
            <div class="info-label">${label}</div>
            <div class="info-value">${value}</div>
        </div>
    `;

}

function getCandidateStatus(genome) {

    const analysis = genome.analysis ?? {};

    const highConfidenceProtein =
        analysis.highConfidenceProteinHits ?? 0;

    const highConfidenceNucleotide =
        analysis.highConfidenceNucleotideHits ?? 0;

    const proteinHits =
        analysis.proteinHits ?? 0;

    const nucleotideHits =
        analysis.nucleotideHits ?? 0;

    if (
        highConfidenceProtein > 0 ||
        highConfidenceNucleotide > 0
    ) {
        return {
            label: "High-confidence candidate",
            className: "status-high"
        };
    }

    if (proteinHits > 0 || nucleotideHits > 0) {
        return {
            label: "Resistance-associated hits detected",
            className: "status-review"
        };
    }

    return {
        label: "No resistance-associated hits detected",
        className: "status-none"
    };

}

function createStatusBadge(status) {

    return `
        <div class="analysis-status ${status.className}">
            ${status.label}
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

        ${displayTaxonomyAndHost(genome)}

        ${displayGenomeQuality(genome)}

    `;

}

function displayResistanceAnalysis(genome) {

    const analysis = genome.analysis ?? {};

    const status = getCandidateStatus(genome);

    return `

        <section class="genome-section">

            <h3>Resistance Analysis</h3>

            ${createStatusBadge(status)}

            ${createInfoRow(
                "Protein Hits",
                (analysis.proteinHits ?? 0).toLocaleString()
            )}

            ${createInfoRow(
                "Nucleotide Hits",
                (analysis.nucleotideHits ?? 0).toLocaleString()
            )}

            ${createInfoRow(
                "High-confidence Protein Hits",
                (
                    analysis.highConfidenceProteinHits ?? 0
                ).toLocaleString()
            )}

            ${createInfoRow(
                "High-confidence Nucleotide Hits",
                (
                    analysis.highConfidenceNucleotideHits ?? 0
                ).toLocaleString()
            )}

            <p class="analysis-note">
                Sequence similarity indicates a candidate resistance-associated
                sequence and does not by itself demonstrate functional antibiotic
                resistance.
            </p>

        </section>

    `;

}

function displayTaxonomyAndHost(genome) {

    return `

        <section class="genome-section">

            <h3>Taxonomy and Host</h3>

            ${createInfoRow(
                "Viral Classification",
                genome.taxonomy ?? "Unknown"
            )}

            ${createInfoRow(
                "Host Organism",
                genome.host
                    ? `<em>${genome.host}</em>`
                    : "Unknown"
            )}

            ${createInfoRow(
                "Host Genus",
                genome.hostGenus
                    ? `
                        <a href="browse.html?search=${encodeURIComponent(
                            genome.hostGenus
                        )}">
                            <em>${genome.hostGenus}</em>
                        </a>
                    `
                    : "Unknown"
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

    if (!accession || !genome) {

        document.getElementById("genomeTitle")
            .textContent = "Genome not found";

        document.getElementById("genomeContent")
            .innerHTML = `
                <section class="genome-section">
                    <p>
                        No genome record was found for the requested
                        accession.
                    </p>

                    <p>
                        <a href="browse.html">
                            Return to Browse Genomes
                        </a>
                    </p>
                </section>
            `;

        return;

    }

    document.getElementById("genomeTitle")
        .textContent = genome.name;

    renderGenomePage(genome);

});