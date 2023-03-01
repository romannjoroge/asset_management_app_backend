const typeDefs = `#graphql
    type User {
        fname: String!
        lname: String!
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
        name: String!
        parentfolder: Folder!
        depreciationtype: String!
        assets: [Asset!]!
        depreciationpercentage: Float
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
        assettag: ID!
        makeandmodelno: String!
        isfixed: Boolean!
        serialnumber: String!
        acquisitiondate: String!
        location: Location!
        status: String!
        custodian: User!
        acquisitioncost: Float!
        insurancevalue: Float!
        residualvalue: Float!
        category: Category!
        assetlifespan: Int!
        attachments: [String!]!
        depreciationschedule: DepreciationSchedule!
    }

    type StockTake {
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

    type Query {
        categories: [Category!]!,
        category (name: ID!): Category,
    }
`

export default typeDefs