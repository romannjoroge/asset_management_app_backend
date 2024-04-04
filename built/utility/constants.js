export const Errors = {
    '0': "Route Does Not Exist",
    '1': 'Could Not Create Asset',
    '2': 'Could Not Display Assets',
    '3': "Location Does Not Exist",
    '4': "Attachment Does Not Exist",
    '5': "Category Does Not Exist",
    '6': "Could Not Add Asset To Category",
    '7': "Asset Already Exists",
    '8': "Could Not Get Asset Details",
    '9': "Internal Server Error",
    '10': "Could Not Get Categories",
    '11': "Could Not Get Category",
    '12': 'Could Not Create Category',
    '13': "Could Not Get Locations",
    '14': "Could Not Get Users",
    '15': "Could Not Create Physical Valuation Report",
    '16': "Could Not Create File",
    '17': "Could Not Send File",
    '18': "User Has No Logs",
    '19': "There Are No Missing Assets",
    '20': "There Are No Allocation Records for asset",
    '21': "There Are No Asset Movements",
    '22': "Could Not Get Data",
    '23': "Could Not Delete File",
    '24': "User Already Exists",
    '25': "Email Already Exists",
    '26': "Invalid Credentials",
    '27': "Not Logged In",
    '28': "Not Authorized",
    '29': "Asset Does Not Exist",
    '30': "User Does Not Exist",
    '31': "Could Not Get Company",
    '32': "Location Already Exists",
    '33': "Site Already Exists",
    '34': "Could Not Get Sites",
    '35': "Barcode Already Exists",
    '36': "Could Not Verify Barcode",
    '37': "Invalid Date Given",
    '38': "Could Not Get Scanned Assets",
    '39': "Reader Already Exists",
    '40': "Antennae Already Exists",
    '41': "Asset With Search Field Does Not Exist",
    '42': "Invalid Search Term",
    '43': "Invalid Item To Update",
    '44': "No Asset Matches Search Term",
    '45': "There Are No Stock Takes For The Chosen Location",
    '46': "There Are No More Child Locations",
    '47': "Could Not Get Depreciation Details",
    '48': "Could Not Create Depreciation Schedule",
    '49': "Invalid Asset Condition",
    '50': "Invalid Depreciation Details",
    '51': "Invalid Attachments",
    '52': "Invalid Residual Value",
    '53': "Invalid Category Details",
    '54': "Category Already Exists",
    '55': "Could Not Create Reader",
    '56': "Reader Does Not Exist",
    '57': "Invalid Antennae Number",
    '58': "Could Not Create Antennae",
    '59': "Invalid Leaving Date",
    '60': "Antennae Does Not Exist",
    '61': "Could Not Verify Details",
    '62': "Could Not Update Antennae",
    '63': "Could Not Update Reader",
    '64': "Invalid Details",
    '65': "Could Not Update User",
    '66': "Could Not Create Batch",
    '67': "Inventory Does Not Exist",
    '68': "Batch Does Not Exist",
    '69': "Could Not Allocate Batch",
    '70': "Could Not Add Asset To Batch",
    '71': "Could Not Update Inventory",
    '72': "Could Not Update Batch",
    '73': "Could Not Read Tag",
    '74': "Could Not Get Asset Movements",
    '75': "Could Not Get Inventories",
};
export var Logs;
(function (Logs) {
    Logs[Logs["CREATE_ASSET"] = 1] = "CREATE_ASSET";
    Logs[Logs["DELETE_ASSET"] = 2] = "DELETE_ASSET";
    Logs[Logs["UPDATE_ASSET"] = 3] = "UPDATE_ASSET";
    Logs[Logs["CREATE_CATEGORY"] = 4] = "CREATE_CATEGORY";
    Logs[Logs["DELETE_CATEGORY"] = 5] = "DELETE_CATEGORY";
    Logs[Logs["UPDATE_CATEGORY"] = 6] = "UPDATE_CATEGORY";
    Logs[Logs["CREATE_LOCATION"] = 7] = "CREATE_LOCATION";
    Logs[Logs["DELETE_LOCATION"] = 8] = "DELETE_LOCATION";
    Logs[Logs["UPDATE_LOCATION"] = 9] = "UPDATE_LOCATION";
    Logs[Logs["CREATE_READER"] = 10] = "CREATE_READER";
    Logs[Logs["DELETE_READER"] = 11] = "DELETE_READER";
    Logs[Logs["UPDATE_READER"] = 12] = "UPDATE_READER";
    Logs[Logs["CREATE_USER"] = 13] = "CREATE_USER";
    Logs[Logs["DELETE_USER"] = 14] = "DELETE_USER";
    Logs[Logs["UPDATE_USER"] = 15] = "UPDATE_USER";
    Logs[Logs["ASSET_REGISTER_REPORT"] = 16] = "ASSET_REGISTER_REPORT";
    Logs[Logs["ASSET_DEPRECIATION_SCHEDULE_REPORT"] = 17] = "ASSET_DEPRECIATION_SCHEDULE_REPORT";
    Logs[Logs["ASSET_ACQUISITION_REPORT"] = 18] = "ASSET_ACQUISITION_REPORT";
    Logs[Logs["STOCK_TAKE_RECONCILIATION_REPORT"] = 19] = "STOCK_TAKE_RECONCILIATION_REPORT";
    Logs[Logs["CATEGORY_DERECIATION_CONFIGURATION_REPORT"] = 20] = "CATEGORY_DERECIATION_CONFIGURATION_REPORT";
    Logs[Logs["ASSET_CATEGORY_REPORT"] = 21] = "ASSET_CATEGORY_REPORT";
    Logs[Logs["AUDIT_TRAIL_REPORT"] = 22] = "AUDIT_TRAIL_REPORT";
    Logs[Logs["CHAIN_OF_CUSTODY_REPORT"] = 23] = "CHAIN_OF_CUSTODY_REPORT";
    Logs[Logs["MOVEMENT_REPORT"] = 24] = "MOVEMENT_REPORT";
    Logs[Logs["REQUEST_GATEPASS"] = 25] = "REQUEST_GATEPASS";
    Logs[Logs["APPROVE_GATEPASS"] = 26] = "APPROVE_GATEPASS";
    Logs[Logs["REJECT_GATEPASS"] = 27] = "REJECT_GATEPASS";
    Logs[Logs["CREATE_INVENTORY"] = 28] = "CREATE_INVENTORY";
    Logs[Logs["DELETE_INVENTORY"] = 29] = "DELETE_INVENTORY";
    Logs[Logs["UPDATE_INVENTORY"] = 30] = "UPDATE_INVENTORY";
    Logs[Logs["CREATE_BATCH"] = 31] = "CREATE_BATCH";
    Logs[Logs["DELETE_BATCH"] = 32] = "DELETE_BATCH";
    Logs[Logs["UPDATE_BATCH"] = 33] = "UPDATE_BATCH";
    Logs[Logs["ASSIGN_BATCH_INVENTORY"] = 34] = "ASSIGN_BATCH_INVENTORY";
    Logs[Logs["UNASSIGN_BATCH_INVENTORY"] = 35] = "UNASSIGN_BATCH_INVENTORY";
    Logs[Logs["UNKOWN"] = 36] = "UNKOWN";
    Logs[Logs["ALLOCATE_ASSET"] = 37] = "ALLOCATE_ASSET";
    Logs[Logs["ASSET_DISPOSAL_REPORT"] = 38] = "ASSET_DISPOSAL_REPORT";
    Logs[Logs["GATEPASS_REPORT"] = 39] = "GATEPASS_REPORT";
    Logs[Logs["STATE_PHYSICAL_VERIFICATION_MISSING"] = 40] = "STATE_PHYSICAL_VERIFICATION_MISSING";
    Logs[Logs["STATE_PHYSICAL_VERIFICATION_PRESENT"] = 41] = "STATE_PHYSICAL_VERIFICATION_PRESENT";
    Logs[Logs["TAGGED_ASSETS"] = 42] = "TAGGED_ASSETS";
    Logs[Logs["UNTAGGED_ASSETS"] = 43] = "UNTAGGED_ASSETS";
    Logs[Logs["ASSET_CATEGORY_DEPRECIATION_REPORT"] = 44] = "ASSET_CATEGORY_DEPRECIATION_REPORT";
})(Logs || (Logs = {}));
export var MyErrors2;
(function (MyErrors2) {
    MyErrors2["NOT_GET_INVENTORIES"] = "Could Not Get Inventories";
    MyErrors2["NOT_STORE_CONVERTED"] = "Could Not Store Converted Assets";
    MyErrors2["NOT_CREATE_READER"] = "Could Not Create Reader";
    MyErrors2["NOT_CONFIRM_READER"] = "Could Not Confirm Reader Details";
    MyErrors2["READER_EXISTS"] = "Reader Already Exists";
    MyErrors2["INTERNAL_SERVER_ERROR"] = "Internal Server Error";
    MyErrors2["INVALID_READER_DETAILS"] = "Invalid Reader Details";
    MyErrors2["NOT_GET_READERS"] = "Could Not Get Readers";
    MyErrors2["READER_DOESNT_EXIST"] = "Reader Does Not Exist";
    MyErrors2["NOT_EDIT_READER"] = "Could Not Update Reader";
    MyErrors2["ASSET_NOT_EXIST"] = "Asset Does Not Exist";
    MyErrors2["NOT_STORE_FILE"] = "Could Not Store File";
    MyErrors2["INVALID_PARENT_CATEGORY"] = "Invalid parent category";
    MyErrors2["EXISTS_LOCATION"] = "Location Already Exists";
    MyErrors2["NOT_CREATE_LOCATION"] = "Could Not Create Location";
    MyErrors2["NOT_READ_TAG"] = "Could Not Read Tag";
    MyErrors2["NOT_PROCESS_TAG"] = "Could Not Process Tag";
    MyErrors2["NOT_CONFIRM_GATEPASS"] = "Could Not Verify If Gatepass Exists";
    MyErrors2["NOT_PROCESS_EXCEL_FILE"] = "Could Not Process The Excel File";
    MyErrors2["COMPANY_EXISTS"] = "Company Already Exists";
    MyErrors2["NOT_CREATE_COMPANY"] = "Could Not Create Company";
    MyErrors2["USER_NOT_EXIST"] = "User Does Not Exist";
    MyErrors2["CATEGORY_NOT_EXIST"] = "Category Does Not Exist";
    MyErrors2["NO_USERS"] = "There Are No Users In The System";
    MyErrors2["NOT_GET_ASSET_DATA"] = "Could Not Get Asset Data";
    MyErrors2["NOT_GET_PARENT_LOCATION"] = "Could Not Get Parent Location";
    MyErrors2["NOT_GET_LOCATION_NAME"] = "Could Not Get Location Name";
    MyErrors2["NOT_ADD_BUILDING_LOCATION"] = "Could Not Add The Building And Location To Asset";
    MyErrors2["NOT_GET_TAGGED_ASSETS"] = "Could Not Get Tagged Assets";
    MyErrors2["EMAIL_ALREADY_EXISTS"] = "The provided email already exists";
    MyErrors2["INVAILID_NAME"] = "The provided name is invalid";
    MyErrors2["INVALID_ROLE"] = "The provided role is invalid";
    MyErrors2["NOT_ADD_OTP"] = "Could Not Store Create OTP In System";
    MyErrors2["NOT_GENERATE_OTP"] = "Could Not Generate OTP";
    MyErrors2["NOT_GET_OTP"] = "Could Not Get OTP Details For User";
    MyErrors2["NOT_DELETE_OTP"] = "Could Not Delete OTP Record";
    MyErrors2["NOT_VERIFY_OTP"] = "Could Not Verify OTP";
    MyErrors2["NOT_SEND_MAIL"] = "Could Not Send Mail";
    MyErrors2["NOT_LOGIN_USER"] = "Could Not Log In User";
    MyErrors2["NOT_GET_USER_ID"] = "Could Not Get User ID";
    MyErrors2["NOT_GET_PARENT_CATEGORY"] = "Could Not Get Parent Category";
    MyErrors2["NOT_ADD_CATEGORY_TO_ASSET"] = "Could Not Add Category And Sub Category To Raw Asset";
    MyErrors2["NOT_GET_CATEGORY_NAME"] = "Could Not Get Category Name";
    MyErrors2["NOT_GENERATE_LOG"] = "Could Not Generate Log";
    MyErrors2["NOT_GENERATE_BARCODE"] = "Could Not Generate Barcode";
    MyErrors2["LOCATION_NOT_EXIST"] = "Location Does Not Exist";
    MyErrors2["ASSET_STATUS_NOT_EXIST"] = "Asset Status Does Not Exist";
    MyErrors2["INVALID_CHARACTER_LENGTH"] = "Character Is Not Right Length";
    MyErrors2["INVALID_BARCODE"] = "Invalid Barcode";
    MyErrors2["NOT_GET_NEXT_ASSET_ID"] = "Could Not Get Next Asset ID";
    MyErrors2["NOT_STORE_ASSET"] = "Could Not Store Asset";
    MyErrors2["NOT_GENERATE_REPORT"] = "Could Not Generate Report";
    MyErrors2["LOG_EVENT_NOT_EXIST"] = "The Log Event Type Does Not Exist";
    MyErrors2["NOT_GET_FROM_DATABASE"] = "Could Not Get Data From Database";
    MyErrors2["NOT_GET_SITE_BUILDING_OFFICE"] = "Could Not Get The Site, Building and Office of Location";
    MyErrors2["REPORT_NOT_SUPPPORTED"] = "The report chosen is not supported by system";
    MyErrors2["NOT_GET_ROLES"] = "Could Not Get Roles";
    MyErrors2["NOT_GET_EVENTS"] = "Could Not Get Events";
    MyErrors2["NOT_GENERATE_MONTLY_DEPRECIATED_ASSETS"] = "Could Not Get List of Assets That Have Fully Depreciated This Month";
    MyErrors2["NOT_GET_MAIL_SUBSCRIPTIONS"] = "Could Not Get Mail Subscriptions";
    MyErrors2["NOT_GET_MAIL_LIST"] = "Could Not Get People Subscribed To Mail";
    MyErrors2["NOT_CHECK_IF_EVENT_EXISTS"] = "Could Not Check If Event Exists In System";
    MyErrors2["NOT_ADD_EVENT"] = "Could Not Create Event";
    MyErrors2["EVENT_ALREADY_EXISTS"] = "The Event Already Exists";
    MyErrors2["NOT_ADD_USER_MAILING_LIST"] = "Could Not Add User To Mailing List";
    MyErrors2["ROUTE_NOT_EXIST"] = "This Route Does Not Exist";
    MyErrors2["NOT_FIND_LOCATION"] = "Could Not Check If Location Exists";
    MyErrors2["NOT_GET_USER_MAIL_SUBSCRIPTIONS"] = "Could Not Get User Mail Subscriptions";
})(MyErrors2 || (MyErrors2 = {}));
export var Success2;
(function (Success2) {
    Success2["CREATED_READER_DEVICE"] = "Reader Device Created Successfully";
    Success2["UPDATE_READER_DEVICE"] = "Reader Device Updated Successfully";
    Success2["SYNC_CONVERTED"] = "Synced Converted Assets Succesfully";
    Success2["CREATED_ASSET"] = "Asset Created Successfuly";
    Success2["CREATED_LOCATION"] = "Location Created";
    Success2["CREATED_STATUS"] = "Asset Status Created";
    Success2["ADDED_USER_MAIL"] = "Added User To Mailing List";
})(Success2 || (Success2 = {}));
export const Succes = {
    '1': 'Asset Created Successfuly',
    '2': "Reports Sent Successfully",
    '3': "Asset Allocated",
    '4': "User Created",
    '5': "Location Created",
    '6': "Site Created",
    '7': "Asset Deleted",
    '8': "Category Created",
    '9': "RFID Reader Created",
    '10': "Antennae Created",
    '11': "Asset Updated",
    '12': 'Category Updated',
    '13': 'GatePass Created',
    '14': 'Location Updated',
    '15': 'Antennae Updated',
    '16': 'RFID Reader Updated',
    '17': "User Updated",
    '18': "GatePass Handled",
    '19': 'Inventory Created',
    "20": "Batch Created",
    '21': "Batch Allocated",
    '22': "Asset Added To Batch",
    '23': "Inventory Updated",
    '24': "Batch Updated",
};
//# sourceMappingURL=constants.js.map