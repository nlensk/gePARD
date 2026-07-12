class Database {

    constructor() {

        this.genomes = [];
        this.loaded = false;

    }

    async load() {

    try {

        const response = await fetch("../data/genomes.json");

        this.genomes = await response.json();

        this.loaded = true;

        console.log("Database loaded.");

        console.log(this.genomes);

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

    isLoaded() {

        return this.loaded;

    }

}

const database = new Database();