import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import userModel from "../models/userModel.js";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import { v2 as cloudinary } from 'cloudinary'
import Hospital from "../models/hospitalModel.js";



const registerUser = async (req, res) => {

    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.json({ success: false, message: 'Missing Details' })
        }

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }

        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" })
        }

        const salt = await bcrypt.genSalt(10); 
        const hashedPassword = await bcrypt.hash(password, salt)

        const userData = {
            name,
            email,
            password: hashedPassword,
        }

        const newUser = new userModel(userData)
        const user = await newUser.save()
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)

        res.json({ success: true, token })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const loginUser = async (req, res) => {

    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email })

        if (!user) {
            return res.json({ success: false, message: "User does not exist" })
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
            res.json({ success: true, token })
        }
        else {
            res.json({ success: false, message: "Invalid credentials" })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const getProfile = async (req, res) => {

    try {
        const { userId } = req.body
        const userData = await userModel.findById(userId).select('-password')

        res.json({ success: true, userData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const updateProfile = async (req, res) => {

    try {

        const { userId, name, phone, address, dob, gender } = req.body
        const imageFile = req.file

        if (!name || !phone || !dob || !gender) {
            return res.json({ success: false, message: "Data Missing" })
        }

        await userModel.findByIdAndUpdate(userId, { name, phone, address: JSON.parse(address), dob, gender })

        if (imageFile) {

            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
            const imageURL = imageUpload.secure_url

            await userModel.findByIdAndUpdate(userId, { image: imageURL })
        }

        res.json({ success: true, message: 'Profile Updated' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const bookAppointment = async (req, res) => {
    try {
        const { userId, docId, slotDate, slotTime, requiresBed } = req.body
        const docData = await doctorModel.findById(docId).select("-password")

        if (!docData.available) {
            return res.json({ success: false, message: 'Doctor Not Available' })
        }

        // Check bed availability if bed is required
        if (requiresBed) {
            const availableBeds = parseInt(process.env.AVAILABLE_BEDS || '50');
            if (availableBeds <= 0) {
                return res.json({ success: false, message: 'No beds available' })
            }
            // Decrease available beds
            process.env.AVAILABLE_BEDS = (availableBeds - 1).toString();
        }

        let slots_booked = docData.slots_booked

        if (slots_booked[slotDate]) {
            if (slots_booked[slotDate].includes(slotTime)) {
                return res.json({ success: false, message: 'Slot Not Available' })
            }
            else {
                slots_booked[slotDate].push(slotTime)
            }
        } else {
            slots_booked[slotDate] = []
            slots_booked[slotDate].push(slotTime)
        }

        const userData = await userModel.findById(userId).select("-password")

        delete docData.slots_booked

        const appointmentData = {
            userId,
            docId,
            userData,
            docData,
            amount: docData.fees,
            slotTime,
            slotDate,
            date: Date.now(),
            requiresBed: requiresBed || false
        }

        const newAppointment = new appointmentModel(appointmentData)
        await newAppointment.save()

        await doctorModel.findByIdAndUpdate(docId, { slots_booked })

        res.json({ 
            success: true, 
            message: 'Appointment Booked',
            bedBooked: requiresBed,
            availableBeds: process.env.AVAILABLE_BEDS
        })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const cancelAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.body
        const appointment = await appointmentModel.findById(appointmentId)
        
        if (!appointment) {
            return res.json({ success: false, message: 'Appointment not found' })
        }

        // If the appointment required a bed, release it back
        if (appointment.requiresBed) {
            const availableBeds = parseInt(process.env.AVAILABLE_BEDS || '50');
            process.env.AVAILABLE_BEDS = (availableBeds + 1).toString();
        }

        // Remove the slot from doctor's booked slots
        const doctor = await doctorModel.findById(appointment.docId)
        if (doctor && doctor.slots_booked[appointment.slotDate]) {
            doctor.slots_booked[appointment.slotDate] = doctor.slots_booked[appointment.slotDate]
                .filter(slot => slot !== appointment.slotTime)
        }
        await doctor.save()

        // Delete the appointment
        await appointmentModel.findByIdAndDelete(appointmentId)

        res.json({ 
            success: true, 
            message: 'Appointment Cancelled',
            bedReleased: appointment.requiresBed,
            availableBeds: process.env.AVAILABLE_BEDS
        })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const listAppointment = async (req, res) => {
    try {

        const { userId } = req.body
        const appointments = await appointmentModel.find({ userId })

        res.json({ success: true, appointments })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const getHospitalStatus = async (req, res) => {
    try {
        const doctors = await doctorModel.find({});
        const hasAvailableDoctors = doctors.some(doc => doc.available);
        const availableBeds = parseInt(process.env.AVAILABLE_BEDS || '50');

        res.json({
            success: true,
            data: {
                name: "Cure Care Hospital",
                acceptsEmergencyCases: hasAvailableDoctors,
                availableBeds: availableBeds,
                totalBeds: 50
            }
        });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export {
    loginUser,
    registerUser,
    getProfile,
    updateProfile,
    bookAppointment,
    listAppointment,
    cancelAppointment,
    getHospitalStatus
}