import mongoose from "mongoose"

const appointmentSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    docId: { type: String, required: true },
    slotDate: { type: String, required: true },
    slotTime: { type: String, required: true },
    userData: { type: Object, required: true },
    docData: { type: Object, required: true },
    amount: { type: Number, required: true },
    date: { type: Number, required: true },
    cancelled: { type: Boolean, default: false },
    payment: { type: Boolean, default: false },
    isCompleted: { type: Boolean, default: false },
    requiresBed: { type: Boolean, default: false }
})

// Pre-save middleware to handle bed allocation
appointmentSchema.pre('save', async function(next) {
    if (this.isNew && this.requiresBed) {
        // Get the current available beds from environment variable or default to 50
        const availableBeds = parseInt(process.env.AVAILABLE_BEDS || '50');
        if (availableBeds <= 0) {
            throw new Error('No beds available');
        }
        // Decrease available beds
        process.env.AVAILABLE_BEDS = (availableBeds - 1).toString();
    }
    next();
});

// Pre-update middleware to handle bed deallocation on cancellation
appointmentSchema.pre('findOneAndUpdate', async function(next) {
    const update = this.getUpdate();
    if (update.cancelled === true) {
        const appointment = await this.model.findOne(this.getQuery());
        if (appointment && appointment.requiresBed && !appointment.cancelled) {
            // Increase available beds
            const availableBeds = parseInt(process.env.AVAILABLE_BEDS || '50');
            process.env.AVAILABLE_BEDS = (availableBeds + 1).toString();
        }
    }
    next();
});

const appointmentModel = mongoose.models.appointment || mongoose.model("appointment", appointmentSchema)
export default appointmentModel