import express from 'express';
const router = express.Router();
// import Asset from '../Allocation/Asset/asset2.js';
// import { Errors, Succes } from '../utility/constants.js';
// import User from '../Users/users.js';
// import MyError from '../utility/myError.js';
// import pool from '../../db2.js';
// // import { convertArrayToCSV } from 'convert-array-to-csv';
// import fs from 'fs/promises';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import assetTable from '../Allocation/Asset/db_assets.js';
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// router.post('/', (req, res) => {
//     // Get data from client
//     const {username, assettag} = req.body;
//     Asset.allocateAsset(assettag, username).then(_ => {
//         return res.send(Succes[3]);
//     }).catch(err => {
//         if (err instanceof MyError) {
//             return res.status(400).json({message:err.message});
//         }
//     })
// });
// router.get('/view', (req, res) => {
//     // Get users and their allocated items
//     pool.query("SELECT assettag, custodianname FROM Asset", []).then(data => {
//         // Return an error if no data is gotten
//         if (data.rowCount <= 0) {
//             return res.status(400).json({message:Errors[22]});
//         }
//         let csvData = data.rows;
//         let csvFromData = convertArrayToCSV(csvData);
//         // Create file
//         fs.writeFile(path.join(__dirname, 'allocation.csv'), csvFromData).then(_ => {
//             const options = {
//                 root: path.join(__dirname),
//             }
//             res.sendFile('allocation.csv', options, err => {
//                 if (err) {
//                     console.log(err);
//                     return res.status(500).json({
//                         message: Errors[17],
//                     });
//                 }
//                 fs.unlink(path.join(__dirname, 'allocation.csv'), err => {
//                     if (err) {
//                         console.log(err);
//                         return res.status(500).json({
//                             message: Errors[23],
//                         })
//                     }
//                 })
//             })
//         }).catch(e => {
//             console.log(e);
//             return res.status(500).json({
//                 message: Errors[16],
//             })
//         });
//     }).catch(e => {
//         console.log(e);
//         return res.status(505).json({message:Errors[9]});
//     })
// });
// router.post('/unallocate', (req, res) => {
//     // Get asset to unallocate
//     const {assettag} = req.body;
//     // Unallocate asset
//     pool.query(assetTable.unallocate, [assettag]).then(_ => {
//         return res.send("Asset Unallocated");
//     }).catch(e => {
//         return res.status(500).json({message:Errors[9]});
//     })
// });
export default router;
//# sourceMappingURL=allocation.js.map