import dotenv from 'dotenv'
import mongoose from 'mongoose'
import connectDB from '../../config/db.js'
import User from '../../models/User.js'
import Doctor from '../../models/Doctor.js'
import Nurse from '../../models/Nurse.js'
import Secretary from '../../models/Secretary.js'
import Patient from '../../models/Patient.js'
import PatientRecord from '../../models/PatientRecord.js'
import Appointment from '../../models/Appointment.js'

dotenv.config()
await connectDB()

const DAYS_TO_SEED = 14
const APPOINTMENTS_PER_DAY = 6
const VISITS_PER_PATIENT_MAX = 3

const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)]

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000)
}

async function loadRefs() {
  const doctors = await Doctor.find({}).populate('userId', 'fullName')
  const nurses = await Nurse.find({}).populate('userId', 'fullName')
  const patients = await Patient.find({}).populate('userId', 'fullName')
  return { doctors, nurses, patients }
}

async function hasConflict(doctorId, startTime, endTime) {
  const conflict = await Appointment.findOne({
    doctor: doctorId,
    status: { $ne: 'cancelled' },
    $or: [
      { startTime: { $lt: endTime, $gte: startTime } },
      { endTime: { $gt: startTime, $lte: endTime } },
      { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
    ]
  })
  return !!conflict
}

async function seedAppointments(doctors, nurses, patients) {
  const created = []
  const now = new Date()

  for (let d = 0; d < DAYS_TO_SEED; d++) {
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d, 9, 0, 0)
    for (let i = 0; i < APPOINTMENTS_PER_DAY; i++) {
      const doctor = randomItem(doctors)
      const patient = randomItem(patients)
      const nurse = randomItem(nurses)

      // 30-min slots between 09:00 and 16:00
      const slotStart = addMinutes(dayStart, 30 * i)
      const slotEnd = addMinutes(slotStart, 30)

      if (await hasConflict(doctor._id, slotStart, slotEnd)) continue

      const appt = new Appointment({
        patient: patient._id,
        doctor: doctor._id,
        nurse: nurse?._id,
        startTime: slotStart,
        endTime: slotEnd,
        status: 'scheduled',
        reason: 'Auto-seeded'
      })
      await appt.save()
      created.push(appt)
    }
  }
  return created
}

async function seedVisits(patients, doctors, nurses) {
  const updated = []
  for (const p of patients) {
    const record = await PatientRecord.findById(p.patientRecord)
    if (!record) continue
    const count = 1 + Math.floor(Math.random() * VISITS_PER_PATIENT_MAX)
    for (let i = 0; i < count; i++) {
      const doctorRef = randomItem(doctors)
      const nurseRef = randomItem(nurses)
      record.visits.push({
        doctorId: doctorRef._id,
        nurseId: nurseRef?._id,
        diagnosis: ['Follow-up', 'Routine Check', 'Consultation'].slice(0, 1 + Math.floor(Math.random() * 3)),
        symptoms: ['Headache', 'Fatigue', 'Cough'].slice(0, 1 + Math.floor(Math.random() * 3)),
        treatments: [
          { name: 'Paracetamol', dosage: '500mg', duration: '3 days' },
          { name: 'Ibuprofen', dosage: '200mg', duration: '5 days' }
        ].slice(0, 1 + Math.floor(Math.random() * 2)),
        notes: 'Auto-seeded visit'
      })
    }
    await record.save()
    updated.push(record._id)
  }
  return updated
}

async function main() {
  try {
    const { doctors, nurses, patients } = await loadRefs()
    if (!doctors.length || !patients.length) {
      console.log('Prerequisite data missing. Run base seed first.')
      return
    }

    const appts = await seedAppointments(doctors, nurses, patients)
    const visits = await seedVisits(patients, doctors, nurses)

    console.log('Bulk data seeding complete.')
    console.log(`Appointments created: ${appts.length}`)
    console.log(`Patients with added visits: ${visits.length}`)
    if (appts[0]) {
      console.log('Sample Appointment:', {
        id: appts[0]._id.toString(),
        doctor: appts[0].doctor.toString(),
        patient: appts[0].patient.toString(),
        startTime: appts[0].startTime,
        endTime: appts[0].endTime
      })
    }
  } catch (e) {
    console.error('Bulk seed failed:', e)
    process.exitCode = 1
  } finally {
    await mongoose.connection.close()
  }
}

await main()


