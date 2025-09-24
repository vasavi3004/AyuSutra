import { addPatientToPractitioner } from '../backend/data/practitionerPatients';

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

export default function handler(req, res) {
  const { method, url } = req;

  // GET: List appointments with optional filters
  if (method === 'GET') {
    if (url.endsWith('/doctor')) {
      const doctorId = req.query.doctorId;
      const result = mockAppointments.filter(a => a.doctor && a.doctor.id === doctorId);
      return res.status(200).json({ success: true, appointments: result });
    }
    if (url.endsWith('/patient')) {
      const patientId = req.query.patientId;
      const result = mockAppointments.filter(a => a.patientId === patientId);
      return res.status(200).json({ success: true, appointments: result });
    }
    if (url.endsWith('/available-slots')) {
      const { practitionerId, date } = req.query;
      const slots = ['09:00','09:30','10:00','10:30','11:00','11:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00'];
      return res.status(200).json({ success: true, practitionerId, date, slots });
    }
    const idMatch = url.match(/\/appointments\/(\d+)$/);
    if (idMatch) {
      const appointment = mockAppointments.find(a => a.id === parseInt(idMatch[1]));
      if (appointment) {
        return res.status(200).json({ success: true, appointment });
      } else {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }
    }
    // Default: list with filters
    const filtered = filterAppointments(mockAppointments, req.query);
    return res.status(200).json({ success: true, appointments: filtered });
  }

  // POST: Create appointment
  if (method === 'POST') {
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
      doctor = list[0];
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
    if (doctor) {
      addPatientToPractitioner(doctor, { id: patientId, name: patientName });
    }
    mockAppointments.push(newAppointment);
    return res.status(200).json({ success: true, appointment: newAppointment });
  }

  // PUT: Update appointment status
  if (method === 'PUT') {
    const idMatch = url.match(/\/appointments\/(\d+)\/status$/);
    if (idMatch) {
      const { status } = req.body;
      const allowed = ['scheduled', 'completed', 'cancelled'];
      if (!allowed.includes(status)) {
        return res.status(400).json({ success: false, message: `Invalid status. Allowed: ${allowed.join(', ')}` });
      }
      const idx = mockAppointments.findIndex(a => a.id === parseInt(idMatch[1]));
      if (idx === -1) return res.status(404).json({ success: false, message: 'Appointment not found' });
      mockAppointments[idx].status = status;
      return res.status(200).json({ success: true, appointment: mockAppointments[idx] });
    }
    return res.status(404).json({ success: false, message: 'Invalid endpoint for PUT' });
  }

  // Default: Method not allowed
  return res.status(405).json({ error: 'Method not allowed' });
}
