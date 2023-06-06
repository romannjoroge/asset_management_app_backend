declare class User {
    constructor();
    static checkIfUserExists(username: any, errorMessage: any): Promise<void>;
}
export default User;
