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
    Logs[Logs["CREATE_ASSET_REMARK"] = 45] = "CREATE_ASSET_REMARK";
    Logs[Logs["ATTACH_ASSET_FILE"] = 46] = "ATTACH_ASSET_FILE";
})(Logs || (Logs = {}));
export var MyErrors2;
(function (MyErrors2) {
    MyErrors2["NOT_GET_INVENTORIES"] = "Error 1: Could Not Get Inventories";
    MyErrors2["NOT_STORE_CONVERTED"] = "Error 2: Could Not Store Converted Assets";
    MyErrors2["NOT_CREATE_READER"] = "Error 3: Could Not Create Reader";
    MyErrors2["NOT_CONFIRM_READER"] = "Error 4: Could Not Confirm Reader Details";
    MyErrors2["READER_EXISTS"] = "Error 5: Reader Already Exists";
    MyErrors2["INTERNAL_SERVER_ERROR"] = "Error 6: Internal Server Error";
    MyErrors2["INVALID_READER_DETAILS"] = "Error 7: Invalid Reader Details";
    MyErrors2["NOT_GET_READERS"] = "Error 8: Could Not Get Readers";
    MyErrors2["READER_DOESNT_EXIST"] = "Error 9: Reader Does Not Exist";
    MyErrors2["NOT_EDIT_READER"] = "Error 10: Could Not Update Reader";
    MyErrors2["ASSET_NOT_EXIST"] = "Error 11: Asset Does Not Exist";
    MyErrors2["NOT_STORE_FILE"] = "Error 12: Could Not Store File";
    MyErrors2["INVALID_PARENT_CATEGORY"] = "Error 13: Invalid parent category";
    MyErrors2["EXISTS_LOCATION"] = "Error 14: Location Already Exists";
    MyErrors2["NOT_CREATE_LOCATION"] = "Error 15: Could Not Create Location";
    MyErrors2["NOT_READ_TAG"] = "Error 16: Could Not Read Tag";
    MyErrors2["NOT_PROCESS_TAG"] = "Error 17: Could Not Process Tag";
    MyErrors2["NOT_CONFIRM_GATEPASS"] = "Error 18: Could Not Verify If Gatepass Exists";
    MyErrors2["NOT_PROCESS_EXCEL_FILE"] = "Error 19: Could Not Process The Excel File";
    MyErrors2["COMPANY_EXISTS"] = "Error 20: Company Already Exists";
    MyErrors2["NOT_CREATE_COMPANY"] = "Error 21: Could Not Create Company";
    MyErrors2["USER_NOT_EXIST"] = "Error 22: User Does Not Exist";
    MyErrors2["CATEGORY_NOT_EXIST"] = "Error 23: Category Does Not Exist";
    MyErrors2["NO_USERS"] = "Error 24: There Are No Users In The System";
    MyErrors2["NOT_GET_ASSET_DATA"] = "Error 25: Could Not Get Asset Data";
    MyErrors2["NOT_GET_PARENT_LOCATION"] = "Error 26: Could Not Get Parent Location";
    MyErrors2["NOT_GET_LOCATION_NAME"] = "Error 27: Could Not Get Location Name";
    MyErrors2["NOT_ADD_BUILDING_LOCATION"] = "Error 28: Could Not Add The Building And Location To Asset";
    MyErrors2["NOT_GET_TAGGED_ASSETS"] = "Error 29: Could Not Get Tagged Assets";
    MyErrors2["EMAIL_ALREADY_EXISTS"] = "Error 30: The provided email already exists";
    MyErrors2["INVAILID_NAME"] = "Error 31: The provided name is invalid";
    MyErrors2["INVALID_ROLE"] = "Error 32: The provided role is invalid";
    MyErrors2["NOT_ADD_OTP"] = "Error 33: Could Not Store Create OTP In System";
    MyErrors2["NOT_GENERATE_OTP"] = "Error 34: Could Not Generate OTP";
    MyErrors2["NOT_GET_OTP"] = "Error 35: Could Not Get OTP Details For User";
    MyErrors2["NOT_DELETE_OTP"] = "Error 36: Could Not Delete OTP Record";
    MyErrors2["NOT_VERIFY_OTP"] = "Error 37: Could Not Verify OTP";
    MyErrors2["NOT_SEND_MAIL"] = "Error 38: Could Not Send Mail";
    MyErrors2["NOT_LOGIN_USER"] = "Error 39: Could Not Log In User";
    MyErrors2["NOT_GET_USER_ID"] = "Error 40: Could Not Get User ID";
    MyErrors2["NOT_GET_PARENT_CATEGORY"] = "Error 41: Could Not Get Parent Category";
    MyErrors2["NOT_ADD_CATEGORY_TO_ASSET"] = "Error 42: Could Not Add Category And Sub Category To Raw Asset";
    MyErrors2["NOT_GET_CATEGORY_NAME"] = "Error 43: Could Not Get Category Name";
    MyErrors2["NOT_GENERATE_LOG"] = "Error 44: Could Not Generate Log";
    MyErrors2["NOT_GENERATE_BARCODE"] = "Error 45: Could Not Generate Barcode";
    MyErrors2["LOCATION_NOT_EXIST"] = "Error 46: Location Does Not Exist";
    MyErrors2["ASSET_STATUS_NOT_EXIST"] = "Error 47: Asset Status Does Not Exist";
    MyErrors2["INVALID_CHARACTER_LENGTH"] = "Error 48: Character Is Not Right Length";
    MyErrors2["INVALID_BARCODE"] = "Error 49: Invalid Barcode";
    MyErrors2["NOT_GET_NEXT_ASSET_ID"] = "Error 50: Could Not Get Next Asset ID";
    MyErrors2["NOT_STORE_ASSET"] = "Error 51: Could Not Store Asset";
    MyErrors2["NOT_GENERATE_REPORT"] = "Error 52: Could Not Generate Report";
    MyErrors2["LOG_EVENT_NOT_EXIST"] = "Error 53: The Log Event Type Does Not Exist";
    MyErrors2["NOT_GET_FROM_DATABASE"] = "Error 54: Could Not Get Data From Database";
    MyErrors2["NOT_GET_SITE_BUILDING_OFFICE"] = "Error 55: Could Not Get The Site, Building and Office of Location";
    MyErrors2["REPORT_NOT_SUPPPORTED"] = "Error 56: The report chosen is not supported by system";
    MyErrors2["NOT_GET_ROLES"] = "Error 57: Could Not Get Roles";
    MyErrors2["NOT_GET_EVENTS"] = "Error 58: Could Not Get Events";
    MyErrors2["NOT_GENERATE_MONTLY_DEPRECIATED_ASSETS"] = "Error 59: Could Not Get List of Assets That Have Fully Depreciated This Month";
    MyErrors2["NOT_GET_MAIL_SUBSCRIPTIONS"] = "Error 60: Could Not Get Mail Subscriptions";
    MyErrors2["NOT_GET_MAIL_LIST"] = "Error 61: Could Not Get People Subscribed To Mail";
    MyErrors2["NOT_CHECK_IF_EVENT_EXISTS"] = "Error 62: Could Not Check If Event Exists In System";
    MyErrors2["NOT_ADD_EVENT"] = "Error 63: Could Not Create Event";
    MyErrors2["EVENT_ALREADY_EXISTS"] = "Error 64: The Event Already Exists";
    MyErrors2["NOT_ADD_USER_MAILING_LIST"] = "Error 65: Could Not Add User To Mailing List";
    MyErrors2["ROUTE_NOT_EXIST"] = "Error 66: This Route Does Not Exist";
    MyErrors2["NOT_FIND_LOCATION"] = "Error 67: Could Not Check If Location Exists";
    MyErrors2["NOT_GET_USER_MAIL_SUBSCRIPTIONS"] = "Error 68: Could Not Get User Mail Subscriptions";
    MyErrors2["NOT_ADD_VALUATION"] = "Error 69: Could Not Add Asset Valuation";
    MyErrors2["NOT_GET_VALUATION"] = "Error 70: Could Not Get Asset Valuations";
    MyErrors2["NOT_ADD_INSURANCE"] = "Error 71: Could Not Add Asset Insurance";
    MyErrors2["NOT_GET_INSURANCE"] = "Error 72: Could Not Get Asset Insurance";
    MyErrors2["GENERATE_ASSET_REPORT_NOT_SUPPORTED"] = "Error 73: Selected Field Is Not Supported";
    MyErrors2["NOT_GET_GENERATE_REPORT_STRUCT"] = "Error 74: Could Not Generate Generate Report Struct";
    MyErrors2["NOT_GENERATE_SELECT_STATEMENT"] = "Error 75: Could Not Generate SELECT STATEMENT";
    MyErrors2["NOT_CREATE_MAIL_SUBSCRIPTION"] = "Error 76: Could Not Create Mail Subscription";
    MyErrors2["NOT_GET_DEPRECIATION_TYPE_OF_ASSET"] = "Error 77: Could Not Get Depreciation Type Of Asset";
    MyErrors2["INVALID_DEPRECIATION_TYPE"] = "Error 78: Invalid Depreciation Type";
    MyErrors2["NOT_GET_DEPRECIATION_SCHEDULE"] = "Error 79: Could Not Get Depreciation Schedule Of Asset";
    MyErrors2["NOT_GET_DEPRECIATION_DETAILS"] = "Error 80: Could Not Get Depreciation Details";
    MyErrors2["INVALID_DEPRECIATION_DETAILS"] = "Error 81: Invalid Depreciation Details";
    MyErrors2["NOT_GET_CURRENT_MARKET_VALUE"] = "Error 82: Could Not Get Current Market Value";
    MyErrors2["NOT_DISPOSE_ASSET"] = "Error 83: Could Not Dispose Asset";
    MyErrors2["NOT_ADD_REMARK"] = "Error 84: Could Not Create Asset Remark";
    MyErrors2["NOT_GET_REMARKS"] = "Error 85: Could Not Get Asset Remarks";
    MyErrors2["NOT_GET_GENERATED_REPORTS"] = "Error 86: Could Not Get Generated Reports";
    MyErrors2["FILE_NOT_EXISTS"] = "Error 87: File Does Not Exist";
    MyErrors2["NOT_CREATE_EXCEL_FILE"] = "Error 88: Could Not Create Excel File";
    MyErrors2["REPORT_NOT_EXIST"] = "Error 89: Report Does Not Exist";
    MyErrors2["NOT_CREATE_USER"] = "Error 90: Could Not Create User";
    MyErrors2["USER_ALREADY_EXISTS"] = "Error 91: User Already Exists";
    MyErrors2["NOT_CREATE_CATEGORY"] = "Error 92: Could Not Create Category";
    MyErrors2["NOT_CREATE_ASSET"] = "Error 93: Could Not Create Asset";
    MyErrors2["INVALID_DATE"] = "Error 94: Invalid Date";
    MyErrors2["NOT_BULK_ACTION_ASSET"] = "Error 95: Could Not Perform Bulk Action on Asset";
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
    Success2["ADD_VALUATION"] = "Valuation Added Succesfully";
    Success2["ADD_INSURANCE"] = "Insurance Added Succesfully";
    Success2["GEN_REPORT"] = "Generated Report Stored Successfully";
    Success2["DISPOSE_ASSET"] = "Disposed Asset Successfully";
    Success2["SET_TIMEOUT"] = "Timeout Updated Successfully";
    Success2["CREATED_REMARK"] = "Created Asset Remark";
    Success2["FILES_UPLOADED"] = "Files Have Been Attached Succesfuly";
    Success2["CUSTOM_REPORT"] = "Custom Report Created Succesfuly";
    Success2["BULK_CREATE_USER"] = "Created Users Successfully";
    Success2["CREATED_CATEGORY"] = "Category Created";
    Success2["BULK_EDIT_COMPLETE"] = "Bulk Updates Complete";
    Success2["UPDATE_ACCOUNT"] = "Account Updated Succesfully";
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