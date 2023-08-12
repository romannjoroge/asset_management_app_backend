import express from 'express';
let router = express.Router();
import storage from '../Importing/multerSetup.js';

router.get('/', (req, res) => {
    res.send("Hello");
});

router.post('/upload', storage.single())

export default router;