import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    pincode: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    acceptsEmergencyCases: {
        type: Boolean,
        default: false
    },
    availableBeds: {
        type: Number,
        default: 50,
        min: 0
    },
    totalBeds: {
        type: Number,
        default: 50
    },
    doctors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor'
    }]
}, {
    timestamps: true
});

// Method to update emergency cases status based on doctor availability
hospitalSchema.methods.updateEmergencyStatus = async function() {
    const doctorCount = await mongoose.model('Doctor').countDocuments({ hospital: this._id, isAvailable: true });
    this.acceptsEmergencyCases = doctorCount > 0;
    await this.save();
};

// Method to update bed count
hospitalSchema.methods.updateBedCount = async function(change) {
    const newCount = this.availableBeds + change;
    if (newCount >= 0 && newCount <= this.totalBeds) {
        this.availableBeds = newCount;
        await this.save();
        return true;
    }
    return false;
};

const Hospital = mongoose.model('Hospital', hospitalSchema);

export default Hospital;
; 