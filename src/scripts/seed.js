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

// ---------------- Seed Configuration (deterministic) ----------------
const SEED_CONFIG = {
  roles: ['Admin', 'Doctor', 'Nurse', 'Secretary', 'Patient'],
  credentials: {
    Admin: [{ fullName: 'System Admin', email: 'admin@careflow.local', password: 'admin123' }],
    Doctor: [
      { fullName: 'Dr. Amina El Fassi', email: 'doctor1@careflow.local', password: 'Staff123!', specialization: 'Cardiology' },
      { fullName: 'Dr. Youssef Benali', email: 'doctor2@careflow.local', password: 'Staff123!', specialization: 'Dermatology' },
      { fullName: 'Dr. Sara Chakir', email: 'doctor3@careflow.local', password: 'Staff123!', specialization: 'Neurology' },
      { fullName: 'Dr. Omar Haddad', email: 'doctor4@careflow.local', password: 'Staff123!', specialization: 'Pediatrics' }
    ],
    Nurse: [
      { fullName: 'Nurse Salma Rania', email: 'nurse1@careflow.local', password: 'Staff123!', shift: 'day' },
      { fullName: 'Nurse Khadija Zahraoui', email: 'nurse2@careflow.local', password: 'Staff123!', shift: 'night' },
      { fullName: 'Nurse Ali El Amrani', email: 'nurse3@careflow.local', password: 'Staff123!', shift: 'rotating' },
      { fullName: 'Nurse Rania El Fassi', email: 'nurse4@careflow.local', password: 'Staff123!', shift: 'day' }
    ],
    Secretary: [
      { fullName: 'Secretary Amina Benali', email: 'secretary1@careflow.local', password: 'Staff123!' },
      { fullName: 'Secretary Youssef Haddad', email: 'secretary2@careflow.local', password: 'Staff123!' }
    ],
    Patient: Array.from({ length: 12 }).map((_, i) => ({
      fullName: `Patient ${i + 1}`,
      email: `patient${i + 1}@careflow.local`,
      password: 'Patient123!',
      address: `Street ${i + 1}, Care City`,
      bloodType: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'][i % 8],
      dateOfBirth: new Date(1990, (i % 12), 1 + (i % 28))
    }))
  }
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
  const permissionsByRole = {
    Admin: [
      'access:admin_panel',
      'manage:roles',
      'create:user',
      'read:user',
      'update:user',
      'delete:user',
      'read:log',
      'create:notification'
    ],
    Doctor: [
      'update:own_profile',
      'read:own_appointments',
      'update:appointment',
      'read:patient_record',
      'create:visit'
    ],
    Nurse: [
      'update:own_profile',
      'read:own_appointments',
      'read:patient_record',
      'create:visit'
    ],
    Secretary: [
      'update:own_profile',
      'create:patient',
      'read:patient',
      'create:appointment',
      'read:appointment',
      'update:appointment'
    ],
    Patient: [
      'create:appointment',
      'read:appointment',
      'update:appointment',
      'read:own_record',
      'read:own_notifications'
    ]
  }

  const roleNames = Object.keys(permissionsByRole)
  const roleDocs = {}
  for (const name of roleNames) {
    const doc = await Role.findOneAndUpdate(
      { name },
      { $set: { name, status: 'active', permissions: permissionsByRole[name] } },
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
  const creds = SEED_CONFIG.credentials.Admin[0]
  const admin = await createUser(creds.fullName, creds.email, roleAdmin._id, { passwordPlain: creds.password, verified: true, status: 'active' })
  return admin
}

async function createDoctors(roleDoctor) {
  const doctors = []
  for (const creds of SEED_CONFIG.credentials.Doctor) {
    const user = await createUser(creds.fullName, creds.email, roleDoctor._id, { passwordPlain: creds.password })
    const doc = new Doctor({
      userId: user._id,
      specialization: creds.specialization || generateSpecialization(),
      workingHours: createWorkingHours()
    })
    await doc.save()
    doctors.push({ user, doc })
  }
  return doctors
}

async function createNurses(roleNurse, doctors) {
  const nurses = []
  let i = 0
  for (const creds of SEED_CONFIG.credentials.Nurse) {
    const user = await createUser(creds.fullName, creds.email, roleNurse._id, { passwordPlain: creds.password })
    const assigned = doctors[i % doctors.length].doc
    const nurse = new Nurse({ userId: user._id, assignedDoctor: assigned._id, shift: creds.shift })
    await nurse.save()
    nurses.push({ user, nurse })
    i++
  }
  return nurses
}

async function createSecretaries(roleSecretary, doctors) {
  const secretaries = []
  for (const creds of SEED_CONFIG.credentials.Secretary) {
    const user = await createUser(creds.fullName, creds.email, roleSecretary._id, { passwordPlain: creds.password })
    const manages = doctors.map((d) => d.doc._id).slice(0, Math.max(1, Math.floor(doctors.length / 2)))
    const sec = new Secretary({ userId: user._id, managingDoctors: manages })
    await sec.save()
    secretaries.push({ user, sec })
  }
  return secretaries
}

async function createPatients(rolePatient, doctors, nurses) {
  const patients = []
  for (const creds of SEED_CONFIG.credentials.Patient) {
    const user = await createUser(creds.fullName, creds.email, rolePatient._id, { passwordPlain: creds.password })

    const record = new PatientRecord({
      bloodType: creds.bloodType || generateBloodType(),
      dateOfBirth: creds.dateOfBirth || new Date(1985 + Math.floor(Math.random() * 20), Math.floor(Math.random() * 12), Math.floor(1 + Math.random() * 28)),
      address: creds.address || 'Test Address',
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
    await createAdmin(roles.Admin)
    const doctors = await createDoctors(roles.Doctor)
    const nurses = await createNurses(roles.Nurse, doctors)
    await createSecretaries(roles.Secretary, doctors)
    const patients = await createPatients(roles.Patient, doctors, nurses)
    await createAppointments(patients, doctors, nurses, 20)

    const summary = {
      Admin: SEED_CONFIG.credentials.Admin.map(({ email, password }) => ({ email, password })),
      Doctor: SEED_CONFIG.credentials.Doctor.map(({ email, password }) => ({ email, password })),
      Nurse: SEED_CONFIG.credentials.Nurse.map(({ email, password }) => ({ email, password })),
      Secretary: SEED_CONFIG.credentials.Secretary.map(({ email, password }) => ({ email, password })),
      Patient: SEED_CONFIG.credentials.Patient.map(({ email, password }) => ({ email, password }))
    }
    console.log('Seeding completed successfully. Login credentials:')
    console.table(summary)
  } catch (err) {
    console.error('Seeding failed:', err)
    process.exitCode = 1
  } finally {
    await mongoose.connection.close()
  }
}

await main()


