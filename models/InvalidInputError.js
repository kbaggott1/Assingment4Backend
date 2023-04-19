class InvalidInputError extends Error {
    constructor(message, options) {
        super(message, options);
        //this.message(message);
    }
}

module.exports = { InvalidInputError };