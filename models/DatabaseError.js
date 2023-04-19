class DatabaseError extends Error {
    constructor(message) {
        super(message);
    }
}

module.exports = {DatabaseError}