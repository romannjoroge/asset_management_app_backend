import pool from "../db2.js";

export async function createAsset(props) {
    await pool.query(`INSERT INTO Asset (assetID, barCode, locationID, noInBuilding, code, description, 
        categoryID, usefulLife, serialNumber, condition, responsibleUsername, acquisitionDate, residualValue, 
        acquisitionCost) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`, [props.assetID, 
        props.barCode, props.locationID, props.noInBuilding, props.code, props.description, props.categoryID,
        props.usefulLife, props.serialNumber, props.condition, props.responsibleUsername, props.acquisitionDate,
        props.residualValue, props.acquisitionCost]);
}

export async function createCategory(props) {
    await pool.query(`INSERT INTO Category (ID, name, depreciationType, parentCategoryID)
        VALUES ($1, $2, $3, $4)`, [props.id, props.name, props.depreciationType, props.parentCategoryID]);
}

export async function createLocation(props) {
    await pool.query(`INSERT INTO Location (id, name, parentlocationid, companyname) VALUES ($1, $2, $3, 'TestCompany')`, [props.id, props.name, props.parentlocationid]);
}

export async function createDepreciationPercent(props) {
    await pool.query(`INSERT INTO DepreciationPercent (categoryID, percentage) VALUES ($1, $2)`, [props.categoryID, props.percentage]);
}

export async function createTemporaryTable(table) {
    await pool.query(`CREATE TEMPORARY TABLE ${table} (LIKE ${table} INCLUDING ALL)`);
}

export async function dropTemporaryTable(table) {
    await pool.query(`DROP TABLE IF EXISTS pg_temp.${table}`);
}

export async function createTestReader(props) {
    await pool.query(`INSERT INTO RFIDReader (hardwareKey, locationID, id, noAntennae) VALUES ($1, $2, $3, $4)`, [props.hardwareKey, props.locationID, props.id, props.noantennae]);
}

export async function createTestAntennae(props) {
    await pool.query("INSERT INTO Antennae (readerID, antennaeno, entry, id) VALUES ($1, $2, $3, $4)", [props.readerid, props.antennaeno, props.entry, props.id]);
}

export async function createTestUser(props) {
    await pool.query("INSERT INTO User2 (id, username, email, password, name, userType, companyname) VALUES ($1, $2, $3, $4, $5, $6, $7)", [props.id, props.username, 
    props.email, props.password, props.name, props.usertype, props.company])
}

export async function createGatePassAuthorization(props) {
    await pool.query("INSERT INTO GatePassAuthorizers (username, locationID) VALUES ($1, $2)", [props.username, props.locationID]);
}

export async function createTestInventory(props) {
    await pool.query("INSERT INTO Inventory (id, name) VALUES ($1, $2)", [props.id, props.name]);
}

export async function createTestBatch(props) {
    await pool.query("INSERT INTO Batch (id, date, comments, locationid) VALUES($1, $2, $3, $4)", [props.id, props.date, props.comments, props.locationid]);
}

export async function createTestReaderDevice(props) {
    await pool.query("INSERT INTO ReaderDevice (readerdeviceid, locationid, deleted, entry, id) VALUES ($1, $2, $3, $4, $5)", 
                    [props.readerdeviceid, props.locationid, props.deleted, props.entry, props.id]);
}

export async function createGatePassAssetEntry(props) {
    await pool.query("INSERT INTO gatepassasset (gatepassid, assetid) VALUES ($1, $2)", [props.gatepassid, props.assetid]);
}

export async function createGatePassEntry(props) {
    await pool.query(
        "INSERT INTO gatepass (id, reason, name, fromlocation, tolocation, date, approved, comment) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
        [props.id, props.reason, props.name, props.fromlocation, props.tolocation, props.date, props.approved, props.comment]
    )
}

export async function createTestLog(props) {
    await pool.query(
        "INSERT INTO Log (id, timestamp, ipaddress, userid, itemid, deleted, eventid) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [props.id, props.timestamp, props.ipaddress, props.userid, props.itemid, props.deleted, props.eventid]
    );
}

export async function createTestEvent(props) {
    await pool.query(
        "INSERT INTO Events (id, type, description) VALUES ($1, $2, $3)",
        [props.id, props.type, props.description]
    );
}