import express from 'express';
const router = express.Router();
import Asset from '../src/Allocation/Asset/asset2.js';
import { Errors, Succes } from '../utility/constants.js';
import User from '../src/Users/users.js';
import MyError from '../utility/myError.js';

router.post('/', (req, res) => {
    // Get data from client
    const {username, assettag} = req.body;

    Asset.allocateAsset(assettag, username).then(_ => {
        return res.send(Succes[3]);
    }).catch(err => {
        if (err instanceof MyError) {
            return res.status(400).json({message:err.message});
        }
    })
});

export default router;