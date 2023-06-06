class MyError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "MyError";
    }
}

export default MyError;