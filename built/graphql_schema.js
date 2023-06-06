const typeDefs = `#graphql
    type User {
        fname: String!
        lname: Sting!
        email: String!
        password: String!
        username: String!
        company: Company!
        role: String!
        assets: [Asset!]
    }

    type Company {
        name: ID!
        users: [User!]!
        topFolder: Folder!
        locations: [Location!]!
    }

    type Folder {
        id: Int!
        name: String!
        company: Company!
        childFolders: [Folder!]!
        locations: [Location!]!
        categories: [Category!]!
    }

    type Location {
        id: Int!
        name: String!
        parentFolder: Folder!
        company: Company!
        assets: [Asset!]!
        rfid_readers: [RFID_Reader!]!
    }

    type Category {
        id: Int!
        name: String!
        parentFolder: Folder!
        depreciaitionType: String!
        assets: [Asset!]!
        depreciationPercentage: Float
    }

    type GatePass {
        id: Int!
        expectedTime: String!
        entry: Boolean!
        user: User!
        reason: String!
        assets: [Asset!]!
    }

    type Asset {
        assetTag: ID!
        makeAndModelNo: String!
        isFixed: Boolean!
        serialNumber: String!
        acquisitionDate: String!
        location: Location!
        status: String!
        custodian: User!
        acquisitionCost: Float!
        insuranceValue: Float!
        residualValue: Float!
        category: Category!
        assetLifeSpan: Int!
        attachments: [String!]!
        DepreciationSchedule: DepreciationSchedule!
    }

    type Stock Take {
        id: ID!
        location: Location!
        String: String!
        assets: [Asset!]!
    }

    type Log {
        id: ID!
        timestamp: String!
        ipAddress: String!
        username: String!
        eventType: String!
        logDescription: String!
    }

    type RFID_Reader {
        id: ID!
        location: Location!
    }

    type DepreciationSchedule {
        year: Int!
        openingBookValue: Float!
        depreciationExpense: Float!
        accumulatedDepreciation: Float!
        closingBookValue: Float!
        asset: Asset!
    }
`;
export default typeDefs;
