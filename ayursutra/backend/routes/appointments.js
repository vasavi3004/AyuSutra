const express = require('express');
const router = express.Router();
const { addPatientToPractitioner } = require('../data/practitionerPatients');

// Mock doctor mapping by treatment type (3 per type)
const treatmentDoctors = {
  'Panchakarma': [
    { id: 'D101', name: 'Dr. Ananya Iyer', specialty: 'Panchakarma Specialist' },
    { id: 'D102', name: 'Dr. Rohan Deshmukh', specialty: 'Detox & Rejuvenation' },
    { id: 'D103', name: 'Dr. Meera Patel', specialty: 'Ayurvedic Physician' }
  ],
  'Abhyanga': [
    { id: 'D201', name: 'Dr. Kavya Nair', specialty: 'Therapeutic Massage' },
    { id: 'D202', name: 'Dr. Arjun Rao', specialty: 'Musculoskeletal Care' },
    { id: 'D203', name: 'Dr. Sneha Kulkarni', specialty: 'Pain Management' }
  ],
  'Shirodhara': [
    { id: 'D301', name: 'Dr. Niharika Sharma', specialty: 'Stress & Sleep Disorders' },
    { id: 'D302', name: 'Dr. Vivek Menon', specialty: 'Neurological Wellness' },
    { id: 'D303', name: 'Dr. Priyanka Joshi', specialty: 'Mind-Body Balance' }
  ],
  'Udvartana': [
    { id: 'D401', name: 'Dr. Sagar Pawar', specialty: 'Metabolic Health' },
    { id: 'D402', name: 'Dr. Aishwarya G', specialty: 'Weight Management' },
    { id: 'D403', name: 'Dr. Harshita Jain', specialty: 'Skin & Detox' }
  ]
};

// Mock appointments data
const mockAppointments = [
  {
    id: 1,
    patientId: 'P001',
    patientName: 'Rajesh Kumar',
    date: '2024-01-20',
    time: '10:00 AM',
    type: 'Panchakarma Consultation',
    treatmentType: 'Panchakarma',
    doctor: { id: 'D101', name: 'Dr. Ananya Iyer', specialty: 'Panchakarma Specialist' },
    status: 'scheduled'
  },
  {
    id: 2,
    patientId: 'P002',
    patientName: 'Priya Sharma',
    date: '2024-01-20',
    time: '2:00 PM',
    type: 'Follow-up',
    treatmentType: 'Abhyanga',
    doctor: { id: 'D201', name: 'Dr. Kavya Nair', specialty: 'Therapeutic Massage' },
    status: 'completed'
  }
];

// Helper: filter by query params
function filterAppointments(list, query) {
  const { patientId, doctorId, status, from, to } = query;
  return list.filter(a => {
    if (patientId && a.patientId !== patientId) return false;
    if (doctorId && (!a.doctor || a.doctor.id !== doctorId)) return false;
    if (status && a.status !== status) return false;
    if (from && new Date(a.date) < new Date(from)) return false;
    if (to && new Date(a.date) > new Date(to)) return false;
    return true;
  });
}

// List appointments with optional filters
router.get('/', (req, res) => {
  const filtered = filterAppointments(mockAppointments, req.query);
  res.json({ success: true, appointments: filtered });
});

// List appointments for a doctor (specific route placed before '/:id')
router.get('/doctor/:doctorId', (req, res) => {
  const result = mockAppointments.filter(a => a.doctor && a.doctor.id === req.params.doctorId);
  res.json({ success: true, appointments: result });
});

// List appointments for a patient (specific route placed before '/:id')
router.get('/patient/:patientId', (req, res) => {
  const result = mockAppointments.filter(a => a.patientId === req.params.patientId);
  res.json({ success: true, appointments: result });
});

// Optional: available slots mock endpoint to satisfy frontend calls
router.get('/available-slots', (req, res) => {
  const { practitionerId, date } = req.query;
  const slots = ['09:00','09:30','10:00','10:30','11:00','11:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00'];
  res.json({ success: true, practitionerId, date, slots });
});

router.get('/:id', (req, res) => {
  const appointment = mockAppointments.find(a => a.id === parseInt(req.params.id));
  if (appointment) {
    res.json({ success: true, appointment });
  } else {
    res.status(404).json({ success: false, message: 'Appointment not found' });
  }
});

// Create appointment; auto-assign doctor if not provided using treatmentType
router.post('/', (req, res) => {
  const { patientId, patientName, date, time, type, treatmentType, doctorId } = req.body;
  if (!patientId || !patientName || !date || !time || !type || !treatmentType) {
    return res.status(400).json({ success: false, message: 'Missing required fields: patientId, patientName, date, time, type, treatmentType' });
  }

  let doctor = null;
  const list = treatmentDoctors[treatmentType] || [];
  if (doctorId) {
    doctor = list.find(d => d.id === doctorId) || null;
  }
  if (!doctor && list.length > 0) {
    doctor = list[0]; // default to first doctor for treatment type
  }

  const newAppointment = {
    id: Date.now(),
    patientId,
    patientName,
    date,
    time,
    type,
    treatmentType,
    doctor,
    status: 'scheduled'
  };
  // Update practitioner's patients registry (demo in-memory store)
  if (doctor) {
    addPatientToPractitioner(doctor, { id: patientId, name: patientName });
  }
  mockAppointments.push(newAppointment);
  res.json({ success: true, appointment: newAppointment });
});

// Update appointment status
router.put('/:id/status', (req, res) => {
  const { status } = req.body;
  const allowed = ['scheduled', 'completed', 'cancelled'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ success: false, message: `Invalid status. Allowed: ${allowed.join(', ')}` });
  }
  const idx = mockAppointments.findIndex(a => a.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ success: false, message: 'Appointment not found' });
  mockAppointments[idx].status = status;
  res.json({ success: true, appointment: mockAppointments[idx] });
});

module.exports = router;
