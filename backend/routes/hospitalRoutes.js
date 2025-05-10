import express from 'express';
import {
    createHospital,
    getHospitals,
    getHospital,
    updateHospital,
    updateEmergencyStatus,
    updateBedCount
} from '../controllers/hospitalController.js';

const router = express.Router();

// Hospital routes
router.post('/', createHospital);
router.get('/', getHospitals);
router.get('/:id', getHospital);
router.put('/:id', updateHospital);
router.put('/:id/emergency-status', updateEmergencyStatus);
router.put('/:id/bed-count', updateBedCount);

export default router; 