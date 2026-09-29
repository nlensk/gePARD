document.addEventListener("DOMContentLoaded", async () => {

    document
        .getElementById("browseButton")
        .addEventListener("click", () => {

            window.location.href = "pages/browse.html";

        });

    await database.load("data/genomes.json");

    console.log(database.getAllGenomes());

});