export class NoMatchingProfileError extends Error {
    code = "NO_MATCHING_PROFILE";
    constructor(message = "No matching music profile found for the given query.") {
        super(message);
        this.name = "NoMatchingProfileError";
    }
}
