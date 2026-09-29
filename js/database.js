class Database {

    constructor() {

        this.genomes = [];
        this.loaded = false;
        this.statistics = null;

    }

    async load(path) {

    if (this.loaded) {
        return;
    }        

    try {
        const response = await fetch(path);

        if (!response.ok) {

            throw new Error("Unable to find genomes.json");

        }

        this.genomes = await response.json();

        this.buildStatistics();

        console.log("Number of genomes:");

        console.log(this.genomes.length);

        this.loaded = true;

        console.log("Database loaded.");

        console.log(
            `Loaded ${this.genomes.length} genomes successfully.`
        );

        for (const genome of this.genomes) {

        if (!genome.accession) {

            console.warn("Genome missing accession:", genome);

        }

}

    }

    catch(error) {

        console.error("Unable to load database.");

        console.error(error);

    }

}

    getAllGenomes() {

        return this.genomes;

    }

    getGenome(accession) {

        return this.genomes.find(
            genome => genome.accession === accession
        );

    }

    buildStatistics() {

        let proteinCandidates = 0;

        for (const genome of this.genomes) {

            if (genome.analysis.proteinHits > 0) {

                proteinCandidates++;

            }

        }

        this.statistics = {

            totalGenomes: this.genomes.length,

            proteinCandidates: proteinCandidates,

            nucleotideCandidates: 0,

            averageGenomeLength: 0,

            largestGenome: null,

            smallestGenome: null

        };

    }
    
    getStatistics() {

        return this.statistics;

    }

    isLoaded() {

        return this.loaded;

    }

}

const database = new Database();