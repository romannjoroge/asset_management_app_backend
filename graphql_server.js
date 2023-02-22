import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

const typeDefs = `#graphql
    type User {
        fname: String!
        lname: Sting!
        email: String!
        password: String!
        username: User!
        company: Company!
        role: String!
    }

    type Company {
        name: ID!
    }

    type Folder {
        id: ID!
        name: String!
        company: Company!
        parentFolder: Folder!
    }

    type Location {
        id: ID!
        name: String!
        parentFolder: Folder!
        company: Company!
    }

    type Category {
        id: ID!
        name: String!
        parentFolder: Folder!
        depreciaitionType: String!
    }

    type DepreciationPercent {
        category: Category!
        perecentage: Float
    }

    type GatePass {
        id: ID!
        expectedTime: Date!
        entry: Boolean!
        username: User!
        reason: String!
        assets: [Asset!]!
    }

    type Asset {
        assetTag: ID!
        makeAndModelNo: String!
        isFixed: Boolean!
        serialNumber: String!
        acquisitionDate: Date!
        location: Location!
        status: String!
        custodianName: ID!
        acquisitionCost: Float!
        insuranceValue: Float!
        residualValue: Float!
        category: Category!
        assetLifeSpan: Int!
        attachments: [String!]!
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
        username: User.username!
        eventType: String!
        logDescription: String!
    }

    type RFID_Reader {
        id: ID!
        location: Location!
    }

    type DepreciationSchedule {
        year: Int
        openingBookValue: Float!
        depreciationExpense: Float!
        accumulatedDepreciation: Float!
        closingBookValue: Float!
        assetTag: Asset.assetTag!
    }

`