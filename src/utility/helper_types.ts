// Defines generic structure of data gotten from database
export interface ResultFromDatabase<Type> {
    rowCount: number;
    rows: Type[]
}