CREATE TABLE Company (
  name varchar(50) NOT NULL,
  deleted BOOL DEFAULT FALSE NOT NULL,
  PRIMARY KEY (name)
);

CREATE TABLE usertype (
  id serial,
  name VARCHAR(50) NOT NULL,
  deleted BOOL NOT NULL DEFAULT FALSE,
  PRIMARY KEY (id)
 );

CREATE TABLE IF NOT EXISTS User2 (
  id serial,
  name varchar(50) NOT NULL,
  email varchar(50) NOT NULL,
  password text NOT NULL,
  username varchar(50) NOT NULL,
  companyname varchar(50) NOT NULL,
  usertype INTEGER,
  deleted BOOL DEFAULT FALSE NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT "FK_User.companyName" FOREIGN KEY (companyname) REFERENCES company(name),
  CONSTRAINT "FK_User2.userType" FOREIGN KEY (usertype) REFERENCES usertype(id)
);

CREATE TABLE BuildingOffice(
  officeID int NOT NULL,
  buildingID int NOT NULL,
  CONSTRAINT "FK_SiteBuilding.officeID"
    FOREIGN KEY (officeID)
      REFERENCES Office(ID),
  CONSTRAINT "FK_SiteBuilding.buildingID"
    FOREIGN KEY (buildingID)
      REFERENCES Building(ID),
  PRIMARY KEY(officeID, buildingID)
);

CREATE TABLE Site(
  ID serial,
  name varchar(50) NOT NULL,
  county varchar(50) NOT NULL,
  city varchar(50) NOT NULL,
  address varchar(100) NOT NULL,
  companyName varchar(50) NOT NULL,
  CONSTRAINT "FK_Folder.companyName"
    FOREIGN KEY (companyName)
      REFERENCES Company(name),
  PRIMARY KEY(ID)
);

CREATE TABLE Office(
  ID serial,
  name varchar(50) NOT NULL,
  companyName varchar(50) NOT NULL,
  CONSTRAINT "FK_Building.companyName"
    FOREIGN KEY (companyName)
      REFERENCES Company(name),
  PRIMARY KEY(ID)
);

CREATE TABLE IF NOT EXISTS Location (
  id serial,
  name varchar(50) NOT NULL,
  companyname varchar(50) NOT NULL,
  parentLocationID int, -- locations are hierarichal
  deleted BOOL DEFAULT FALSE NOT NULL,
  PRIMARY KEY (ID),
  CONSTRAINT "FK_Location.companyName" FOREIGN KEY (companyname) REFERENCES company(name),
  CONSTRAINT "FK_Location.parentLocationID" FOREIGN KEY (parentlocationid) REFERENCES location(id)
);

CREATE TABLE IF NOT EXISTS Category (
  id serial,
  name varchar(50) NOT NULL UNIQUE, 
  depreciationtype varchar(50) NOT NULL,
  parentcategoryid INTEGER, -- parent of the category, categories have a hierarichal relationship
  deleted BOOL DEFAULT FALSE,
  PRIMARY KEY (ID),
  CONSTRAINT "FK_Category.parentCategoryID"
    FOREIGN KEY (parentcategoryid)
      REFERENCES category(id)
);

-- CREATE TABLE parentChildCategory(
--   parentID int,
--   childID int,
--   PRIMARY KEY(parentID, childID),
--   CONSTRAINT "FK_Category.parentID"
--     FOREIGN KEY (parentID) REFERENCES Category(ID),
--   CONSTRAINT "FK_Category.childID"
--     FOREIGN KEY (childID) REFERENCES Category(ID)
-- );

CREATE TABLE depreciationpercent (
  categoryid INTEGER NOT NULL,
  percentage double precision NOT NULL,
  deleted BOOL DEFAULT FALSE NOT NULL,
  PRIMARY KEY (categoryid),
  CONSTRAINT "FK_DepreciationPercent.categoryID" FOREIGN KEY (categoryid) REFERENCES category(id)
);

CREATE TABLE AssetValuationHistory(
  ID serial,
  assetID int,
  valuationValue float,
  valuationDate date,
  PRIMARY KEY (ID),
  CONSTRAINT "FK_AssetValuationHistory.assetID"
    FOREIGN KEY (assetID)
      REFERENCES Asset(assetID)
);

CREATE TABLE Asset (
  barcode VARCHAR(20),
  code VARCHAR(255),
  assetid serial,
  noinbuilding INTEGER,
  condition VARCHAR(255),
  responsibleusername VARCHAR(255),
  description TEXT,
  deleted BOOL DEFAULT FALSE NOT NULL,
  disposalvalue double precision DEFAULT 0.0,
  disposaldate DATE DEFAULT NOW(),
  currentvaluationvalue double precision DEFAULT 0.0,
  latestvaluationdate DATE DEFAULT NOW(),
  depreciationtype varchar(50),
  depreciationpercent double precision,
  istagged BOOL DEFAULT FALSE NOT NULL,
  serialnumber varchar(50),
  acquisitiondate date DEFAULT NOW(),
  locationid int,
  acquisitioncost double precision,
  residualvalue double precision,
  categoryid int,
  usefullife smallint,
  lastConverted timestamp,
  isConverted BOOL DEFAULT FALSE,
  PRIMARY KEY (assetid),
  CONSTRAINT "FK_Asset.categoryID" FOREIGN KEY (categoryid) REFERENCES category(id),
  CONSTRAINT "FK_Asset.custodianID" FOREIGN KEY (responsibleusername) REFERENCES user2(username),
  CONSTRAINT "FK_Asset.locationID" FOREIGN KEY (locationid) REFERENCES location(id)
);

CREATE TABLE Asset_File (
  assetTag varchar(50),
  attachment varchar(100),
  PRIMARY KEY (assetTag, attachment),
  CONSTRAINT "FK_Asset File.assetTag"
    FOREIGN KEY (assetTag)
      REFERENCES Asset(assetTag)
);

CREATE TABLE GatePassAuthorizers (
  userid varchar(50),
  locationID int,
  deleted NOT NULL DEFAULT false,
  PRIMARY KEY(username, locationID),
  CONSTRAINT "FK_GatePassAuthorizers.username"
    FOREIGN KEY (username)
      REFERENCES User2(username),
  CONSTRAINT "FK_GatePassAuthorizers.locationID"
    FOREIGN KEY (locationID)
      REFERENCES Location(ID)
);

CREATE TABLE AuthorizeGatepass (
  userid int,
  gatePassID int,
  deleted boolean DEFAULT false,
  PRIMARY KEY (userid, gatePassID),
  CONSTRAINT "FK_AuthorizeGatepass.userid"
    FOREIGN KEY (userid)
      REFERENCES User2(id),
  CONSTRAINT "FK_AuthorizeGatepass.gatePassID"
    FOREIGN KEY (gatePassID)
      REFERENCES GatePass(ID)
);

CREATE TABLE Inventory (
  ID serial,
  name text NOT NULL,
  deleted BOOL DEFAULT FALSE NOT NULL,
  PRIMARY KEY (ID)
);

CREATE TABLE Batch (
  id serial,
  date timestamp with time zone NOT NULL,
  comments text,
  locationid int,
  deleted BOOL DEFAULT FALSE NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT "FK_Batch.locationID" FOREIGN KEY (locationid) REFERENCES location(id)
);

CREATE TABLE InventoryBatch (
  inventoryid int NOT NULL,
  batchid int NOT NULL,
  deleted BOOL DEFAULT FALSE NOT NULL,
  PRIMARY KEY (inventoryid, batchid),
  CONSTRAINT "FK_InventoryBatch.batchID" FOREIGN KEY (batchid) REFERENCES batch(id),
  CONSTRAINT "FK_InventoryBatch.inventoryID" FOREIGN KEY (inventoryid) REFERENCES inventory(id)
);

CREATE TABLE BatchAsset (
  batchid int NOT NULL,
  assetid int NOT NULL,
  deleted BOOL DEFAULT FALSE NOT NULL,
  PRIMARY KEY (batchid, assetid),
  CONSTRAINT "FK_BatchAsset.assetID" FOREIGN KEY (assetid) REFERENCES asset(assetid),
  CONSTRAINT "FK_BatchAsset.batchID" FOREIGN KEY (batchid) REFERENCES batch(id)
);

CREATE TABLE StockTake (
  ID serial,
  locationID int,
  date timestamptz,
  PRIMARY KEY (ID),
  CONSTRAINT "FK_Stock Take.locationID"
    FOREIGN KEY (locationID)
      REFERENCES Location(ID)
);

CREATE TABLE Role (
  id serial,
  name varchar(50),
  deleted BOOL DEFAULT FALSE NOT NULL,
  PRIMARY KEY (ID)
);

CREATE TABLE "Parent Child Folder" (
  "folderID" int,
  "parentFolderID" int,
  PRIMARY KEY ("folderID"),
  CONSTRAINT "FK_Parent Child Folder.parentFolderID"
    FOREIGN KEY ("parentFolderID")
      REFERENCES "Folder"("ID")
);

CREATE TABLE StockTakeAssets (
  assetTag varchar(50),
  stockTakeID int,
  PRIMARY KEY (assetTag, stockTakeID),
  CONSTRAINT "FK_Stock Take Assets.assetTag"
    FOREIGN KEY (assetTag)
      REFERENCES Asset(assetTag),
  CONSTRAINT "FK_Stock Take Assets.stockTakeID"
    FOREIGN KEY (stockTakeID)
      REFERENCES StockTake(ID)
);

CREATE TABLE "GatePass_Asset" (
  "gatePassID" int,
  "assetTag" varchar(50),
  PRIMARY KEY ("gatePassID", "assetTag"),
  CONSTRAINT "FK_GatePass Asset.gatePassID"
    FOREIGN KEY ("gatePassID")
      REFERENCES "GatePass"("ID"),
  CONSTRAINT "FK_GatePass Asset.assetTag"
    FOREIGN KEY ("assetTag")
      REFERENCES "Asset"("assetTag")
);

CREATE TABLE IF NOT EXISTS Events (
  id serial,
  type text NOT NULL UNIQUE,
  description text NOT NULL,
  PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS Log (
  ID serial,
  timestamp timestamptz, -- timestamp
  ipAddress inet, -- ip address of the user who created the event
  deleted BOOLEAN DEFAULT false, -- whethere event is deleted
  userid INTEGER NOT NULL, -- reference to the user that created the event
  itemid INTEGER, -- stores a referenece to the item that the event occured to
  eventid INTEGER NOT NULL, -- stores the type of event
  CONSTRAINT "FK_Log_userid" FOREIGN KEY (userid) REFERENCES user2(id),
  CONSTRAINT "FK_Log_eventid" FOREIGN KEY (eventid) REFERENCES events(id),
  PRIMARY KEY (ID)
);

CREATE TABLE depreciationschedule (
  year INTEGER NOT NULL,
  openingbookvalue DOUBLE precision NOT NULL,
  depreciationexpense DOUBLE precision NOT NULL,
  accumulateddepreciation DOUBLE precision NOT NULL,
  closingbookvalue DOUBLE precision NOT NULL,
  assetid INTEGER,
  deleted BOOLEAN DEFAULT FALSE,
  CONSTRAINT "FK_DepreciationSchedule.assetid" FOREIGN KEY (assetid) REFERENCES asset(assetid)
);

CREATE TABLE Role (
  id serial,
  name varchar(50),
  PRIMARY KEY(id)
);

CREATE TABLE userrole (
  userid INTEGER NOT NULL,
  roleid int NOT NULL,
  deleted BOOLEAN DEFAULT FALSE,
  CONSTRAINT "FK_UserRole_userid" FOREIGN KEY (userid) REFERENCES user2(id),
  PRIMARY KEY (userid, roleid)
);

CREATE TABLE "RFID Reader" (
  "ID" serial,
  "locationID" int,
  PRIMARY KEY ("ID"),
  CONSTRAINT "FK_RFID Reader.locationID"
    FOREIGN KEY ("locationID")
      REFERENCES "Location"("ID")
);

CREATE TABLE DepreciationSchedule (
  year int NOT NULL,
  openingBookValue float NOT NULL,
  depreciationExpense float NOT NULL,
  accumulatedDepreciation float NOT NULL,
  closingBookValue float NOT NULL,
  assetTag varchar(50),
  CONSTRAINT "FK_DepreciationSchedule.assetTag"
    FOREIGN KEY (assetTag)
      REFERENCES Asset(assetTag),
  PRIMARY KEY (year, assetTag)
);

CREATE TABLE Tags(
  id serial,
  scannedtime timestamp with time zone DEFAULT NOW(),
  commandcode varchar(50) NOT NULL,
  hardwarekey varchar(50) NOT NULL,
  tagrecnums varchar(50) NOT NULL,
  antno INTEGER NOT NULL,
  pc varchar(50) NOT NULL,
  epcid varchar(50) NOT NULL,
  crc varchar(50) NOT NULL,
  deleted BOOLEAN DEFAULT false NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE processedtags (
  id serial,
  scannedtime timestamp with time zone DEFAULT NOW() NOT NULL,
  assetid int NOT NULL,
  readerdeviceid VARCHAR(50) NOT NULL,
  deleted BOOLEAN DEFAULT false NOT NULL,
  PRIMARY KEY (id),
);

CREATE TABLE IF NOT EXISTS readerdevice (
  id varchar(50),
  PRIMARY KEY (id),
  locationid int,
  CONSTRAINT "FK_ReaderDevice.locationID" FOREIGN KEY (locationid) REFERENCES location(id),
  deleted BOOL DEFAULT FALSE NOT NULL,
  entry BOOL DEFAULT TRUE NOT NULL
);

CREATE TABLE RFIDReader(
  id serial,
  address int NOT NULL,
  locationID int NOT NULL,
  deleted boolean NOT NULL DEFAULT false,
  name varchar(50) NOT NULL,
  CONSTRAINT "FK_RFIDReader.locationID"
    FOREIGN KEY (locationID)
      REFERENCES Location(ID),
  PRIMARY KEY (id)
);

CREATE TABLE Antennae(
  id serial,
  readerID int NOT NULL,
  name varchar(50) NOT NULL,
  entry boolean NOT NULL,
  deleted boolean NOT NULL DEFAULT false,
  CONSTRAINT "FK_Antennae.readerID"
    FOREIGN KEY (readerID)
      REFERENCES RFIDReader(ID),
  PRIMARY KEY (id)
);

CREATE TABLE gatepass (
  id serial,
  reason text,
  deleted boolean NOT NULL DEFAULT false,
  name text,
  fromlocation int,
  tolocation int,
  date timestamp with time zone,
  approved boolean DEFAULT false,
  comment text,
  PRIMARY KEY (id),
  CONSTRAINT "FK_GatePass.fromLocation" FOREIGN KEY (fromlocation) REFERENCES location(id),
  CONSTRAINT "FK_GatePass.toLocation" FOREIGN KEY (tolocation) REFERENCES location(id)
);


CREATE TABLE gatepassauthorizers (
  userid int NOT NULL,
  locationid int NOT NULL,
  deleted boolean NOT NULL DEFAULT false,
  PRIMARY KEY (userid, locationid),
  CONSTRAINT "FK_GatePassAuthorizers.locationID" FOREIGN KEY (locationid) REFERENCES location(id),
  CONSTRAINT "FK_GatePassAuthorizers" FOREIGN KEY (userid) REFERENCES user2(id)
);

CREATE TABLE IF NOT EXISTS UserOTP(
  id SERIAL,
  userid INT NOT NULL,
  otp text,
  created_time timestamptz NOT NULL,
  PRIMARY KEY(id),
  CONSTRAINT "FK_UserOTP_userid" FOREIGN KEY (userid) REFERENCES user2(id)
);


CREATE TABLE gatepassasset(
  gatepassid int NOT NULL,
  assetid int NOT NULL,
  deleted boolean NOT NULL DEFAULT false,
  PRIMARY KEY (gatepassid, assetid),
  CONSTRAINT "FK_GatePassAsset.assetTag" FOREIGN KEY (assetid) REFERENCES asset(assetid),
  CONSTRAINT "FK_GatePassAsset.gatePassID" FOREIGN KEY (gatepassid) REFERENCES gatepass(id)
);

CREATE TABLE readerdevice (
  id serial,
  locationid int NOT NULL,
  deleted boolean NOT NULL DEFAULT false,
  entry BOOL NOT NULL DEFAULT true,
  PRIMARY KEY (id),
  CONSTRAINT "FK_ReaderDevice.locationID" FOREIGN KEY (locationid) REFERENCES location(id)
);

CREATE TABLE ProcessedTags (
  id serial,
  scannedTime timestamp with time zone NOT NULL DEFAULT NOW(),
  assetID int NOT NULL,
  readerDeviceID int NOT NULL,
  pc varchar(50) NOT NULL,
  deleted boolean NOT NULL DEFAULT false
);


-- Creates the home folder when the database is created. This is the topmost folder in the system
INSERT INTO Folder(name) VALUES('home');

-- Set dates to be in format mm-dd-yyyy
SET datestyle TO MDY;

-- Gives asset_management the right password
ALTER USER asset_management WITH PASSWORD 'the password';

-- Commands to do on server
INSERT INTO Events (id, type, description) VALUES (37, 'ALLOCATE_ASSET', 'Asset Has Been Allocated');
ALTER TABLE Log ADD COLUMN toid INTEGER;
ALTER TABLE Log ALTER COLUMN timestamp SET DEFAULT NOW();
