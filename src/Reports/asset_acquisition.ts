import { AssetRegisterData } from "./helpers.js";

/**
 * 
 * @param startDate The beginning of purchase period
 * @param endDate The ending of purchase period
 * @param locationid The location to look into
 * @returns The details of assets purchased in purchasing period in the specified location and its child locations
 */
export function assetAcquisition(startDate: Date, endDate: Date, locationid: number): Promise<AssetRegisterData[]> {
    return new Promise((res, rej) => {
        
    })
}