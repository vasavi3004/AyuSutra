const mockPatients = [
  {
    id: 'P001',
    name: 'Rajesh Kumar',
    age: 45,
    gender: 'Male',
    phone: '+91 98765 43210',
    email: 'rajesh.kumar@email.com',
    constitution: 'Vata-Pitta',
    currentCondition: 'Chronic joint pain, insomnia'
  },
  {
    id: 'P002',
    name: 'Priya Sharma',
    age: 32,
    gender: 'Female',
    phone: '+91 87654 32109',
    email: 'priya.sharma@email.com',
    constitution: 'Pitta-Kapha',
    currentCondition: 'Digestive issues, stress'
  }
];

export default function handler(req, res) {
  const { method, url } = req;
  // GET /api/patients
  if (method === 'GET' && url.endsWith('/patients')) {
    return res.status(200).json({ success: true, patients: mockPatients });
  }
  // GET /api/patients/:id
  const idMatch = url.match(/\/patients\/(P\d{3})$/);
  if (method === 'GET' && idMatch) {
    const patient = mockPatients.find(p => p.id === idMatch[1]);
    if (patient) {
      return res.status(200).json({ success: true, patient });
    } else {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
  }
  // Default: Method not allowed or endpoint not found
  return res.status(404).json({ success: false, message: 'Endpoint not found or method not allowed' });
}
