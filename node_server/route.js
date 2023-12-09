// routes.js
const express = require('express');
const router = express.Router();
const storeController = require('./storeController');

router.get('/', (req, res) => {
    res.send("Docker With Nodejs");
});

router.get('/db/my-store-main-image', storeController.getMyStoreMainImage);
router.get('/db/storeInfo', storeController.getAllStoreInfo);
router.get('/db/storeInfo/:crn', storeController.getStoreInfo);
router.get('/db/all-company-registration-number', storeController.getAllCompanyRegistrationNumber);
router.post('/db/store-registration', storeController.registerStore);
router.post('/db/store-menu', storeController.uploadStoreMenu);
router.put('/db/modify-storeInfo', storeController.modifyStoreInfo);
router.delete('/db/delete-storeInfo/:crn', storeController.deleteStoreInfo);


module.exports = router;
