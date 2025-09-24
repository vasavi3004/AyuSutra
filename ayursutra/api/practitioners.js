import { getPatientsByPractitioner } from '../backend/data/practitionerPatients';

const practitioners = [
  { id: 'D101', name: 'Dr. Ananya Iyer', specialty: 'Panchakarma Specialist' },
  { id: 'D102', name: 'Dr. Rohan Deshmukh', specialty: 'Detox & Rejuvenation' },
  { id: 'D103', name: 'Dr. Meera Patel', specialty: 'Ayurvedic Physician' },
  { id: 'D201', name: 'Dr. Kavya Nair', specialty: 'Therapeutic Massage' },
  { id: 'D202', name: 'Dr. Arjun Rao', specialty: 'Musculoskeletal Care' },
  { id: 'D203', name: 'Dr. Sneha Kulkarni', specialty: 'Pain Management' },
  { id: 'D301', name: 'Dr. Niharika Sharma', specialty: 'Stress & Sleep Disorders' },
  { id: 'D302', name: 'Dr. Vivek Menon', specialty: 'Neurological Wellness' },
  { id: 'D303', name: 'Dr. Priyanka Joshi', specialty: 'Mind-Body Balance' },
  { id: 'D401', name: 'Dr. Sagar Pawar', specialty: 'Metabolic Health' },
  { id: 'D402', name: 'Dr. Aishwarya G', specialty: 'Weight Management' },
  { id: 'D403', name: 'Dr. Harshita Jain', specialty: 'Skin & Detox' },
  { id: 'D501', name: 'Dr. Ritu Kapoor', specialty: 'ENT & Respiratory' },
  { id: 'D502', name: 'Dr. Aman Gupta', specialty: 'Sinus & Allergy Care' },
  { id: 'D503', name: 'Dr. Neha Bansal', specialty: 'Head & Neck Therapy' },
  { id: 'D601', name: 'Dr. Kiran Shetty', specialty: 'Digestive Wellness' },
  { id: 'D602', name: 'Dr. Pooja Rao', specialty: 'Gut Health & Detox' },
  { id: 'D603', name: 'Dr. Mahesh I', specialty: 'Colon Therapy' },
];

export default function handler(req, res) {
  const { method, url } = req;
  // GET /api/practitioners
  if (method === 'GET' && url.endsWith('/practitioners')) {
    return res.status(200).json({ success: true, practitioners });
  }
  // GET /api/practitioners/:id
  const idMatch = url.match(/\/practitioners\/(D\d{3})$/);
  if (method === 'GET' && idMatch) {
    const doc = practitioners.find(p => p.id === idMatch[1]);
    if (!doc) return res.status(404).json({ success: false, message: 'Practitioner not found' });
    return res.status(200).json({ success: true, practitioner: doc });
  }
  // GET /api/practitioners/:id/patients
  const patientsMatch = url.match(/\/practitioners\/(D\d{3})\/patients$/);
  if (method === 'GET' && patientsMatch) {
    const patients = getPatientsByPractitioner(patientsMatch[1]);
    return res.status(200).json({ success: true, practitionerId: patientsMatch[1], patients });
  }
  // Default: Method not allowed or endpoint not found
  return res.status(404).json({ success: false, message: 'Endpoint not found or method not allowed' });
}
