let currentGenomes = [];

let currentPage = 1;

let isRestoringUrlState = false;

const genomesPerPage = 2;

const validHitFilters = [
    "all",
    "anyHits",
    "proteinHits",
    "nucleotideHits",
    "highConfidence",
    "noHits"
];

const validSortOptions = [
    "nameAsc",
    "nameDesc",
    "lengthDesc",
    "lengthAsc",
    "proteinDesc",
    "nucleotideDesc"
];

function getCandidateStatus(genome) {

    const analysis =
        genome.analysis ?? {};

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

    if (
        proteinHits > 0 ||
        nucleotideHits > 0
    ) {

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

function createGenomeCard(genome) {

    const status =
        getCandidateStatus(genome);

    const card = document.createElement("div");

    card.className = "genome-card";

    card.style.cursor = "pointer";

    card.addEventListener("click", () => {

        window.location.href =
            `genome.html?accession=${genome.accession}`;

    });

    card.innerHTML = `
        <h2>${genome.name}</h2>

        <div class="analysis-status ${status.className}">
            ${status.label}
        </div>

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
            document.getElementById(
                "searchInput"
            );

        searchInput.value = "";

        currentPage = 1;

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

function getBrowseStateFromUrl() {

    const parameters =
        new URLSearchParams(
            window.location.search
        );

    const searchQuery =
        parameters.get("search") ?? "";

    const requestedHitFilter =
        parameters.get("filter") ?? "all";

    const requestedSortOption =
        parameters.get("sort") ?? "nameAsc";

    const hitFilter =
        validHitFilters.includes(
            requestedHitFilter
        )
            ? requestedHitFilter
            : "all";

    const sortOption =
        validSortOptions.includes(
            requestedSortOption
        )
            ? requestedSortOption
            : "nameAsc";

    const pageValue =
        Number(parameters.get("page"));

    const page =
        Number.isInteger(pageValue) &&
        pageValue > 0
            ? pageValue
            : 1;

    return {
        searchQuery,
        hitFilter,
        sortOption,
        page
    };

}

function updateBrowseUrl() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );

    const hitFilter =
        document.getElementById(
            "hitFilter"
        );

    const sortSelect =
        document.getElementById(
            "sortSelect"
        );

    const parameters =
        new URLSearchParams();

    const searchQuery =
        searchInput.value.trim();

    if (searchQuery !== "") {

        parameters.set(
            "search",
            searchQuery
        );

    }

    if (hitFilter.value !== "all") {

        parameters.set(
            "filter",
            hitFilter.value
        );

    }

    if (sortSelect.value !== "nameAsc") {

        parameters.set(
            "sort",
            sortSelect.value
        );

    }

    if (currentPage > 1) {

        parameters.set(
            "page",
            currentPage
        );

    }

    const queryString =
        parameters.toString();

    const newUrl =
        queryString === ""
            ? window.location.pathname
            : `${window.location.pathname}?${queryString}`;

    window.history.replaceState(
        {},
        "",
        newUrl
    );

}

function updateBrowseTitle() {

    const searchQuery =
        document
            .getElementById("searchInput")
            .value
            .trim();

    if (searchQuery === "") {

        document.title =
            "Browse Genomes | PARD";

        return;

    }

    document.title =
        `Search: ${searchQuery} | PARD`;

}

function updateGenomeCount(
    pageResultCount,
    filteredTotal,
    databaseTotal
) {

    const countElement =
        document.getElementById(
            "genomeCount"
        );

    if (filteredTotal === 0) {

        countElement.textContent =
            `Showing 0 of ` +
            `${databaseTotal.toLocaleString()} genomes`;

        return;

    }

    const firstResult =
        (currentPage - 1) *
        genomesPerPage + 1;

    const lastResult =
        firstResult +
        pageResultCount - 1;

    if (filteredTotal === databaseTotal) {

        countElement.textContent =
            `Showing genomes ` +
            `${firstResult.toLocaleString()}–` +
            `${lastResult.toLocaleString()} ` +
            `of ${databaseTotal.toLocaleString()}`;

        return;

    }

    countElement.textContent =
        `Showing genomes ` +
        `${firstResult.toLocaleString()}–` +
        `${lastResult.toLocaleString()} ` +
        `of ${filteredTotal.toLocaleString()} matches ` +
        `(${databaseTotal.toLocaleString()} total)`;

}

function sortGenomes(genomes, sortOption) {
    const sorted = [...genomes];
    const compare = sortFunctions[sortOption];

    if (compare) {
        sorted.sort(compare);
    }

    return sorted;
}

function paginateGenomes(genomes, page, pageSize) {

    const startIndex =
        (page - 1) * pageSize;

    const endIndex =
        startIndex + pageSize;

    return genomes.slice(
        startIndex,
        endIndex
    );

}

function scrollToBrowseTop() {

    const genomeCount =
        document.getElementById(
            "genomeCount"
        );

    genomeCount.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}

function displayPagination(totalResults) {

    const container =
        document.getElementById(
            "paginationControls"
        );

    container.innerHTML = "";

    const totalPages =
        Math.ceil(
            totalResults / genomesPerPage
        );

    if (totalPages <= 1) {
        return;
    }

    const previousButton =
        document.createElement("button");

    previousButton.type = "button";
    previousButton.className =
        "pagination-button";

    previousButton.textContent =
        "Previous";

    previousButton.disabled =
        currentPage === 1;

    const pageInformation =
        document.createElement("span");

    pageInformation.className =
        "pagination-information";

    pageInformation.textContent =
        `Page ${currentPage} of ${totalPages}`;

    const nextButton =
        document.createElement("button");

    nextButton.type = "button";
    nextButton.className =
        "pagination-button";

    nextButton.textContent =
        "Next";

    nextButton.disabled =
        currentPage === totalPages;

    previousButton.addEventListener(
        "click",
        () => {

            if (currentPage > 1) {

                currentPage--;

                applyBrowseState();

                scrollToBrowseTop();

            }

        }
    );

    nextButton.addEventListener(
        "click",
        () => {

            if (currentPage < totalPages) {

                currentPage++;

                applyBrowseState();

                scrollToBrowseTop();

            }

        }
    );

    container.appendChild(
        previousButton
    );

    container.appendChild(
        pageInformation
    );

    container.appendChild(
        nextButton
    );

}

function applyBrowseState() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );

    const hitFilter =
        document.getElementById(
            "hitFilter"
        );

    const sortSelect =
        document.getElementById(
            "sortSelect"
        );

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

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                sortedGenomes.length /
                genomesPerPage
            )
        );

    if (currentPage > totalPages) {
        currentPage = totalPages;
    }

    const paginatedGenomes =
        paginateGenomes(
            sortedGenomes,
            currentPage,
            genomesPerPage
        );

    updateGenomeCount(
        paginatedGenomes.length,
        filteredGenomes.length,
        currentGenomes.length
    );

    displayGenomes(
        paginatedGenomes
    );

    displayPagination(
        filteredGenomes.length
    );

    if (!isRestoringUrlState) {

        updateBrowseUrl();

    }

    updateBrowseTitle();

}

function restoreBrowseStateFromUrl() {

    isRestoringUrlState = true;

    const state =
        getBrowseStateFromUrl();

    const searchInput =
        document.getElementById(
            "searchInput"
        );

    const hitFilter =
        document.getElementById(
            "hitFilter"
        );

    const sortSelect =
        document.getElementById(
            "sortSelect"
        );

    searchInput.value =
        state.searchQuery;

    hitFilter.value =
        state.hitFilter;

    sortSelect.value =
        state.sortOption;

    currentPage =
        state.page;

    applyBrowseState();

    isRestoringUrlState = false;

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

    const initialState =
        getBrowseStateFromUrl();

    searchInput.value =
        initialState.searchQuery;

    hitFilter.value =
        initialState.hitFilter;

    sortSelect.value =
        initialState.sortOption;

    currentPage =
        initialState.page;

    sortSelect.addEventListener("change", () => {

        currentPage = 1;

        applyBrowseState();

    });

    searchInput.addEventListener("input", () => {

        currentPage = 1;

        applyBrowseState();

    });

    hitFilter.addEventListener("change", () => {

        currentPage = 1;

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

window.addEventListener(
    "popstate",
    () => {

        restoreBrowseStateFromUrl();

    }
);