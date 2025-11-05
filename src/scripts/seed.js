import dotenv from 'dotenv'
import mongoose from 'mongoose'
import connectDB from '../config/db.js'
import Role from '../models/Role.js'
import User from '../models/User.js'
import Doctor from '../models/Doctor.js'
import Nurse from '../models/Nurse.js'
import Secretary from '../models/Secretary.js'
import Patient from '../models/Patient.js'
import PatientRecord from '../models/PatientRecord.js'
import Appointment from '../models/Appointment.js'
import { hashPassword } from '../utils/hashing.js'

// Try to use faker if available; otherwise fall back to simple generators
let faker
try {
  const mod = await import('faker')
  faker = mod.default || mod
} catch (e) {
  faker = null
}

dotenv.config()
await connectDB()

const isReset = process.argv.includes('--reset') || process.argv.includes('-r')

const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)]

const generateName = () => {
  if (faker) return faker.name.findName()
  const first = ['Ali', 'Omar', 'Youssef', 'Sara', 'Khadija', 'Amina', 'Salma', 'Rania']
  const last = ['El Fassi', 'El Amrani', 'Benali', 'Chakir', 'Haddad', 'Zahraoui']
  return `${randomItem(first)} ${randomItem(last)}`
}

const generateEmail = (name, domain = 'careflow.local') => {
  const slug = name.toLowerCase().replace(/[^a-z]+/g, '.')
  return `${slug}.${Math.floor(Math.random() * 10000)}@${domain}`
}

const generateSpecialization = () => {
  const specs = ['Cardiology', 'Dermatology', 'Neurology', 'Pediatrics', 'Orthopedics', 'General Medicine']
  return randomItem(specs)
}

const generateBloodType = () => randomItem(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])

const createWorkingHours = () => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday']
  return days.map((d) => ({
    dayOfWeek: d,
    timeSlots: [
      { startTime: '09:00', endTime: '09:30', isAvailable: true },
      { startTime: '09:30', endTime: '10:00', isAvailable: true },
      { startTime: '10:00', endTime: '10:30', isAvailable: true },
      { startTime: '14:00', endTime: '14:30', isAvailable: true },
      { startTime: '14:30', endTime: '15:00', isAvailable: true }
    ]
  }))
}

async function upsertRoles() {
  const roleNames = ['admin', 'doctor', 'nurse', 'secretary', 'patient']
  const roleDocs = {}
  for (const name of roleNames) {
    const doc = await Role.findOneAndUpdate(
      { name },
      { $setOnInsert: { name, status: 'active' } },
      { upsert: true, new: true }
    )
    roleDocs[name] = doc
  }
  return roleDocs
}

async function createUser(fullName, email, roleId, { passwordPlain = 'Password123!', verified = true, status = 'active' } = {}) {
  const existing = await User.findOne({ email })
  if (existing) return existing
  const user = new User({
    fullName,
    email,
    password: await hashPassword(passwordPlain),
    role: roleId,
    status,
    isEmailVerified: verified
  })
  await user.save()
  return user
}

async function createAdmin(roleAdmin) {
  const fullName = 'System Admin'
  const email = 'admin@careflow.local'
  const admin = await createUser(fullName, email, roleAdmin._id, { passwordPlain: 'admin123', verified: true, status: 'active' })
  return admin
}

async function createDoctors(roleDoctor, count = 3) {
  const doctors = []
  for (let i = 0; i < count; i++) {
    const name = generateName()
    const email = generateEmail(name)
    const user = await createUser(name, email, roleDoctor._id, {})
    const doc = new Doctor({ userId: user._id, specialization: generateSpecialization(), workingHours: createWorkingHours() })
    await doc.save()
    doctors.push({ user, doc })
  }
  return doctors
}

async function createNurses(roleNurse, doctors, count = 3) {
  const nurses = []
  for (let i = 0; i < count; i++) {
    const name = generateName()
    const email = generateEmail(name)
    const user = await createUser(name, email, roleNurse._id, {})
    const assigned = doctors[i % doctors.length].doc
    const nurse = new Nurse({ userId: user._id, assignedDoctor: assigned._id })
    await nurse.save()
    nurses.push({ user, nurse })
  }
  return nurses
}

async function createSecretaries(roleSecretary, doctors, count = 2) {
  const secretaries = []
  for (let i = 0; i < count; i++) {
    const name = generateName()
    const email = generateEmail(name)
    const user = await createUser(name, email, roleSecretary._id, {})
    const manages = doctors.map((d) => d.doc._id).slice(0, Math.max(1, Math.floor(doctors.length / 2)))
    const sec = new Secretary({ userId: user._id, managingDoctors: manages })
    await sec.save()
    secretaries.push({ user, sec })
  }
  return secretaries
}

async function createPatients(rolePatient, doctors, nurses, count = 10) {
  const patients = []
  for (let i = 0; i < count; i++) {
    const name = generateName()
    const email = generateEmail(name)
    const user = await createUser(name, email, rolePatient._id, {})

    const record = new PatientRecord({
      bloodType: generateBloodType(),
      dateOfBirth: new Date(1980 + Math.floor(Math.random() * 25), Math.floor(Math.random() * 12), Math.floor(1 + Math.random() * 28)),
      address: 'Test Address',
      visits: []
    })
    await record.save()

    const patient = new Patient({ userId: user._id, patientRecord: record._id })
    await patient.save()

    // Add an initial visit
    const doctorRef = randomItem(doctors).doc
    const nurseRef = randomItem(nurses).nurse
    record.visits.push({
      doctorId: doctorRef._id,
      nurseId: nurseRef._id,
      diagnosis: ['Initial Checkup'],
      symptoms: ['Headache'],
      treatments: [{ name: 'Paracetamol', dosage: '500mg', duration: '3 days' }],
      notes: 'Auto-generated seed visit'
    })
    await record.save()

    patients.push({ user, patient, record })
  }
  return patients
}

async function createAppointments(patients, doctors, nurses, count = 15) {
  const now = new Date()
  const appts = []
  for (let i = 0; i < count; i++) {
    const p = randomItem(patients).patient
    const d = randomItem(doctors).doc
    const n = randomItem(nurses).nurse
    const start = new Date(now.getTime() + (i + 1) * 60 * 60 * 1000)
    const end = new Date(start.getTime() + 30 * 60 * 1000)
    const a = new Appointment({ patient: p._id, doctor: d._id, nurse: n._id, startTime: start, endTime: end, status: 'scheduled', reason: 'Routine check' })
    await a.save()
    appts.push(a)
  }
  return appts
}

async function resetCollections() {
  const collections = [Appointment, Patient, PatientRecord, Secretary, Nurse, Doctor, User, Role]
  for (const Model of collections) {
    try { await Model.deleteMany({}) } catch (e) { /* ignore */ }
  }
}

async function main() {
  try {
    if (isReset) await resetCollections()

    const roles = await upsertRoles()
    await createAdmin(roles.admin)
    const doctors = await createDoctors(roles.doctor, 4)
    const nurses = await createNurses(roles.nurse, doctors, 4)
    await createSecretaries(roles.secretary, doctors, 2)
    const patients = await createPatients(roles.patient, doctors, nurses, 12)
    await createAppointments(patients, doctors, nurses, 20)

    console.log('Seeding completed successfully.')
  } catch (err) {
    console.error('Seeding failed:', err)
    process.exitCode = 1
  } finally {
    await mongoose.connection.close()
  }
}

await main()


