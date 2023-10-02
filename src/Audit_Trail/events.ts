// This file contains the enum defining the events that are tracked
export enum AuditTrailEvents {
    "CREATE_ASSET" = "Asset Created",
    "DELETE_ASSET" = "Asset Deleted",
    "UPDATE_ASSET" = "Asset Updated",
    "CREATE_CATEGORY" = "Category Created",
    "DELETE_CATEGORY" = "Category Deleted",
    "UPDATE_CATEGORY" = "Category Updated",
    "CREATE_LOCATION" = "Location Created",
    "DELETE_LOCATION" = "Location Deleted",
    "UPDATE_LOCATION" = "Location Updated",
    "CREATE_READER" = "Reader Created",
    "DELETE_READER" = "Reader Deleted",
    "UPDATE_READER" = "Reader Updated",
    "CREATE_USER" = "User Created",
    "DELETE_USER" = "User Deleted",
    "UPDATE_USER" = "User Updated",
    "ASSET_REGISTER_REPORT" = "Asset Register Report Generated",
    "ASSET_DEPRECIATION_SCHEDULE_REPORT" = "Asset Depreciation Schedule Report Generated",
    "ASSET_ACQUISITION_REPORT" = "Asset Acquisition Report Generated",
    "STOCK_TAKE_RECONCILIATION_REPORT" = "Stock Take Reconciliation Report Generated",
    "CATEGORY_DERECIATION_CONFIGURATION_REPORT" = "Category Depreciation Configuration Report Generated",
    "ASSET_CATEGORY_REPORT" = "Asset Category Report Generated",
    "AUDIT_TRAIL_REPORT" = "Audit Trail Report Generated",
    "CHAIN_OF_CUSTODY_REPORT" = "Chain Of Custody Report Generated",
    "MOVEMENT_REPORT" = "Movement Report Generated",
    "REQUEST_GATEPASS" = "Gatepass Requested",
    "APPROVE_GATEPASS" = "Gatepass Approved",
    "REJECT_GATEPASS" = "Gatepass Rejected",
    "CREATE_INVENTORY" = "Inventory Created",
    "DELETE_INVENTORY" = "Inventory Deleted",
    "UPDATE_INVENTORY" = "Inventory Updated",
    "CREATE_BATCH" = "Batch Created",
    "DELETE_BATCH" = "Batch Deleted",
    "UPDATE_BATCH" = "Batch Updated",
    "ASSIGN_BATCH_INVENTORY" = "Batch assigned to inventory",
    "UNASSIGN_BATCH_INVENTORY" = "Batch unassigned to inventory",
    "UNKOWN" = "Unknown Event"
}