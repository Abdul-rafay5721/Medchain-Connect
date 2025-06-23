const mongoose = require('mongoose');

const GrantAccessSchema = new mongoose.Schema({
    patientWallet: {
        type: String,
        required: true
    },
    providerWallet: {
        type: String,
        required: true
    },
    grantAccess: {
        type: String,
        enum: ['Yes', 'No'],
        required: true
    },
    accepted: {
        type: String,
        enum: ['Yes', 'No'],
        required: true,
        default: 'No'
    }
}, { timestamps: true });

module.exports = mongoose.model('GrantAccess', GrantAccessSchema);
