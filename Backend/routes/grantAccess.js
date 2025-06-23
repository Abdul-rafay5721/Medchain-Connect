const express = require('express');
const router = express.Router();
const { createGrantAccess, getByProviderWallet, getByPatientWallet, deleteGrantAccess, updateAccepted } = require('../controllers/grantAccessController');

router.post('/', createGrantAccess);
router.get('/provider/:providerWallet', getByProviderWallet);
router.get('/patient/:patientWallet', getByPatientWallet);
router.delete('/:id', deleteGrantAccess);
router.put('/accept/:id', updateAccepted);

module.exports = router;
