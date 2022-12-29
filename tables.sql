CREATE TABLE "User" (
  "ID" serial,
  "email" varchar(50),
  "password" varchar(50),
  "username" varchar(50),
  "companyName" varchar(50),
  PRIMARY KEY ("ID"),
  CONSTRAINT "FK_User.companyName"
    FOREIGN KEY ("companyName")
      REFERENCES "Company"("name")
);

CREATE TABLE "Company" (
  "name" varchar(50),
  "ownerID" int,
  PRIMARY KEY ("name"),
  CONSTRAINT "FK_Company.ownerID"
    FOREIGN KEY ("ownerID")
      REFERENCES "User"("ID")
);

CREATE TABLE "Folder" (
  "ID" serial,
  "name" varchar(50),
  PRIMARY KEY ("ID")
);

CREATE TABLE "Location" (
  "ID" serial,
  "name" varchar(50),
  "parentFolderID" int,
  "companyName" varchar(50),
  PRIMARY KEY ("ID"),
  CONSTRAINT "FK_Location.companyName"
    FOREIGN KEY ("companyName")
      REFERENCES "Company"("name"),
  CONSTRAINT "FK_Location.parentFolderID"
    FOREIGN KEY ("parentFolderID")
      REFERENCES "Folder"("ID")
);

CREATE TABLE "Category" (
  "ID" serial,
  "name" varchar(50),
  "parentFolderID" int,
  "depreciationType" varchar(50),
  PRIMARY KEY ("ID"),
  CONSTRAINT "FK_Category.parentFolderID"
    FOREIGN KEY ("parentFolderID")
      REFERENCES "Folder"("ID")
);

CREATE TABLE "Depreciation Percent" (
  "categoryID" int,
  "percentage" float,
  PRIMARY KEY ("categoryID")
);

CREATE TABLE "GatePass" (
  "ID" serial,
  "expectedTime" timestampz,
  "entry" boolean,
  "userID" int,
  "reason" text,
  PRIMARY KEY ("ID"),
  CONSTRAINT "FK_GatePass.userID"
    FOREIGN KEY ("userID")
      REFERENCES "User"("ID")
);

CREATE TABLE "Asset" (
  "assetTag" varchar(50),
  "makeAndModelNo" varchar(50),
  "isFixed" boolean,
  "serialNumber" varchar(50),
  "acquisitionDate" date,
  "locationID" int,
  "status" varchar(10),
  "custodianID" int,
  "acquisitionCost" money,
  "insuranceValue" money,
  "categoryID" int,
  "assetLifeSpan" smallint,
  PRIMARY KEY ("assetTag"),
  CONSTRAINT "FK_Asset.locationID"
    FOREIGN KEY ("locationID")
      REFERENCES "Location"("ID"),
  CONSTRAINT "FK_Asset.categoryID"
    FOREIGN KEY ("categoryID")
      REFERENCES "Category"("ID"),
  CONSTRAINT "FK_Asset.custodianID"
    FOREIGN KEY ("custodianID")
      REFERENCES "User"("ID")
);

CREATE TABLE "Asset File" (
  "assetTag" varchar(50),
  "attachment" varchar(50),
  PRIMARY KEY ("assetTag", "attachment"),
  CONSTRAINT "FK_Asset File.assetTag"
    FOREIGN KEY ("assetTag")
      REFERENCES "Asset"("assetTag")
);

CREATE TABLE "Stock Take" (
  "ID" serial,
  "locationID" int,
  "date" timestampz,
  PRIMARY KEY ("ID"),
  CONSTRAINT "FK_Stock Take.locationID"
    FOREIGN KEY ("locationID")
      REFERENCES "Location"("ID")
);

CREATE TABLE "Role" (
  "ID" serail,
  "name" varchar(50),
  PRIMARY KEY ("ID")
);

CREATE TABLE "Parent Child Folder" (
  "folderID" int,
  "parentFolderID" int,
  PRIMARY KEY ("folderID"),
  CONSTRAINT "FK_Parent Child Folder.parentFolderID"
    FOREIGN KEY ("parentFolderID")
      REFERENCES "Folder"("ID")
);

CREATE TABLE "Stock Take Assets" (
  "assetTag" varchar(50),
  "stockTakeID" int,
  PRIMARY KEY ("assetTag", "stockTakeID"),
  CONSTRAINT "FK_Stock Take Assets.assetTag"
    FOREIGN KEY ("assetTag")
      REFERENCES "Asset"("assetTag"),
  CONSTRAINT "FK_Stock Take Assets.stockTakeID"
    FOREIGN KEY ("stockTakeID")
      REFERENCES "Stock Take"("ID")
);

CREATE TABLE "Depreciation Per Year" (
  "categoryID" int,
  "value" money,
  PRIMARY KEY ("categoryID")
);

CREATE TABLE "GatePass Asset" (
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

CREATE TABLE "Log" (
  "ID" serial,
  "timestamp" timestampz,
  "ipAddress" inet,
  "userID" int,
  "eventType" varchar(50),
  "logDescription" text,
  PRIMARY KEY ("ID"),
  CONSTRAINT "FK_Log.userID"
    FOREIGN KEY ("userID")
      REFERENCES "User"("ID")
);

CREATE TABLE "User Role" (
  "userID" int,
  "roleID" int,
  PRIMARY KEY ("userID", "roleID"),
  CONSTRAINT "FK_User Role.userID"
    FOREIGN KEY ("userID")
      REFERENCES "User"("ID")
);

CREATE TABLE "RFID Reader" (
  "ID" serial,
  "locationID" int,
  PRIMARY KEY ("ID"),
  CONSTRAINT "FK_RFID Reader.locationID"
    FOREIGN KEY ("locationID")
      REFERENCES "Location"("ID")
);

