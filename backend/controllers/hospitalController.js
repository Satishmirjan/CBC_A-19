import Hospital from '../models/hospitalModel.js';
import Doctor from '../models/doctorModel.js';

// Create a new hospital
export const createHospital = async (req, res) => {
    try {
        const hospital = new Hospital(req.body);
        await hospital.save();
        res.status(201).json({ success: true, data: hospital });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Get all hospitals
export const getHospitals = async (req, res) => {
    try {
        const hospitals = await Hospital.find().populate('doctors');
        res.status(200).json({ success: true, data: hospitals });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get a single hospital
export const getHospital = async (req, res) => {
    try {
        const hospital = await Hospital.findById(req.params.id).populate('doctors');
        if (!hospital) {
            return res.status(404).json({ success: false, message: 'Hospital not found' });
        }
        res.status(200).json({ success: true, data: hospital });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update hospital
export const updateHospital = async (req, res) => {
    try {
        const hospital = await Hospital.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!hospital) {
            return res.status(404).json({ success: false, message: 'Hospital not found' });
        }
        res.status(200).json({ success: true, data: hospital });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Update emergency status
export const updateEmergencyStatus = async (req, res) => {
    try {
        const hospital = await Hospital.findById(req.params.id);
        if (!hospital) {
            return res.status(404).json({ success: false, message: 'Hospital not found' });
        }
        await hospital.updateEmergencyStatus();
        res.status(200).json({ success: true, data: hospital });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update bed count
export const updateBedCount = async (req, res) => {
    try {
        const { change } = req.body;
        const hospital = await Hospital.findById(req.params.id);
        if (!hospital) {
            return res.status(404).json({ success: false, message: 'Hospital not found' });
        }
        const success = await hospital.updateBedCount(change);
        if (!success) {
            return res.status(400).json({ success: false, message: 'Invalid bed count change' });
        }
        res.status(200).json({ success: true, data: hospital });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}; 