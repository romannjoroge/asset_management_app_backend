export default typeDefs;
declare const typeDefs: "#graphql\n    type User {\n        fname: String!\n        lname: Sting!\n        email: String!\n        password: String!\n        username: String!\n        company: Company!\n        role: String!\n        assets: [Asset!]\n    }\n\n    type Company {\n        name: ID!\n        users: [User!]!\n        topFolder: Folder!\n        locations: [Location!]!\n    }\n\n    type Folder {\n        id: Int!\n        name: String!\n        company: Company!\n        childFolders: [Folder!]!\n        locations: [Location!]!\n        categories: [Category!]!\n    }\n\n    type Location {\n        id: Int!\n        name: String!\n        parentFolder: Folder!\n        company: Company!\n        assets: [Asset!]!\n        rfid_readers: [RFID_Reader!]!\n    }\n\n    type Category {\n        id: Int!\n        name: String!\n        parentFolder: Folder!\n        depreciaitionType: String!\n        assets: [Asset!]!\n        depreciationPercentage: Float\n    }\n\n    type GatePass {\n        id: Int!\n        expectedTime: String!\n        entry: Boolean!\n        user: User!\n        reason: String!\n        assets: [Asset!]!\n    }\n\n    type Asset {\n        assetTag: ID!\n        makeAndModelNo: String!\n        isFixed: Boolean!\n        serialNumber: String!\n        acquisitionDate: String!\n        location: Location!\n        status: String!\n        custodian: User!\n        acquisitionCost: Float!\n        insuranceValue: Float!\n        residualValue: Float!\n        category: Category!\n        assetLifeSpan: Int!\n        attachments: [String!]!\n        DepreciationSchedule: DepreciationSchedule!\n    }\n\n    type Stock Take {\n        id: ID!\n        location: Location!\n        String: String!\n        assets: [Asset!]!\n    }\n\n    type Log {\n        id: ID!\n        timestamp: String!\n        ipAddress: String!\n        username: String!\n        eventType: String!\n        logDescription: String!\n    }\n\n    type RFID_Reader {\n        id: ID!\n        location: Location!\n    }\n\n    type DepreciationSchedule {\n        year: Int!\n        openingBookValue: Float!\n        depreciationExpense: Float!\n        accumulatedDepreciation: Float!\n        closingBookValue: Float!\n        asset: Asset!\n    }\n";
