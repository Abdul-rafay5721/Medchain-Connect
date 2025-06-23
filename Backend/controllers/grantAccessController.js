const GrantAccess = require('../models/GrantAccess');

exports.createGrantAccess = async (req, res) => {
    try {
        const { patientWallet, providerWallet, grantAccess } = req.body;
        // Check if the same record already exists
        const exists = await GrantAccess.findOne({ patientWallet, providerWallet, grantAccess });
        if (exists) {
            return res.status(409).message('Grant access already exists for this patient and provider');
        }
        const newGrant = new GrantAccess({ patientWallet, providerWallet, grantAccess });
        await newGrant.save();
        res.status(201).json({ message: 'Grant access stored', data: newGrant });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getByProviderWallet = async (req, res) => {
    console.log(`Fetching grants for provider wallet: ${req.params.providerWallet}`);
    
    try {
        const { providerWallet } = req.params;
        const grants = await GrantAccess.find({ providerWallet });
        res.json(grants);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getByPatientWallet = async (req, res) => {
    try {
        const { patientWallet } = req.params;
        console.log(`Fetching grants for patient wallet: ${patientWallet}`);
        
        const grants = await GrantAccess.find({ patientWallet });
        res.json(grants);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteGrantAccess = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await GrantAccess.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: 'Record not found' });
        }
        res.json({ message: 'Record deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updateAccepted = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await GrantAccess.findByIdAndUpdate(
            id,
            { accepted: 'Yes' },
            { new: true }
        );
        if (!updated) {
            return res.status(404).json({ message: 'Record not found' });
        }
        res.json({ message: 'Accepted updated to Yes', data: updated });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
