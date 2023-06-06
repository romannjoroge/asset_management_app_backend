declare class Location {
    constructor();
    static verifyLocationID(id: any): Promise<boolean>;
}
export default Location;
