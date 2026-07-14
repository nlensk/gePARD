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

    document.getElementById("genomeContent").innerHTML = `
        <p><strong>Accession:</strong> ${genome.accession}</p>
    `;

});