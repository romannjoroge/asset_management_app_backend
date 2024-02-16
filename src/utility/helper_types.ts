// Defines generic structure of data gotten from database
interface ResultFromDatabase<Type> {
    rowCount: number;
    rows: Type[]
}