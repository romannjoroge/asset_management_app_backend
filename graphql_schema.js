const typeDefs = `#graphql
    type User {
        fname: String!
        lname: Sting!
        email: String!
        password: String!
        username: User!
        companyName: ID!
        role: String!
        assets: [Asset!]
    }

    type Company {
        name: ID!
        users: [User!]!
        topFolderID: Int!
        locations: [Location!]!
    }

    type Folder {
        id: Int!
        name: String!
        companyName: ID!
        childFolders: [Folder!]!
        locations: [Location!]!
        categories: [Category!]!
    }

    type Location {
        id: Int!
        name: String!
        parentFolderID: Int!
        companyName: ID!
        assets: [Asset!]!
        rfid_readers: [RFID_Reader!]!
    }

    type Category {
        id: Int!
        name: String!
        parentFolderID: Int!
        depreciaitionType: String!
        assets: [Asset!]!
        depreciationPercentage: Float
    }

    type GatePass {
        id: Int!
        expectedTime: Date!
        entry: Boolean!
        username: String!
        reason: String!
        assets: [Asset!]!
    }

    type Asset {
        assetTag: ID!
        makeAndModelNo: String!
        isFixed: Boolean!
        serialNumber: String!
        acquisitionDate: Date!
        locationID: Int!
        status: String!
        custodianName: String!
        acquisitionCost: Float!
        insuranceValue: Float!
        residualValue: Float!
        categoryID: Int!
        assetLifeSpan: Int!
        attachments: [String!]!
        DepreciationSchedule: DepreciationSchedule!
    }

    type Stock Take {
        id: ID!
        location: Location!
        date: Date!
        assets: [Asset!]!
    }

    type Log {
        id: ID!
        timestamp: Date!
        ipAddress: String!
        username: String!
        eventType: String!
        logDescription: String!
    }

    type RFID_Reader {
        id: ID!
        locationID: Int!
    }

    type DepreciationSchedule {
        year: Int
        openingBookValue: Float!
        depreciationExpense: Float!
        accumulatedDepreciation: Float!
        closingBookValue: Float!
        assetTag: String!
    }
`

export default typeDefs