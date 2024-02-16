interface AssetRegisterData {
    serial_number: string;
    acquisition_date: string;
    condition: string;
    responsible_users_name: string;
    acquisition_cost: number;
    residual_value: number;
    category_name: string;
    useful_life: number;
    barcode: string;
    description: string;
    site: string;
    building: string;
    office: string;
    expected_depreciation_date: string;
    days_to_disposal: number
}

/**
 * A function to get the data of the asset register report
 */
export function getAssetRegister() {

}