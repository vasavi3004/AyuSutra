const express = require('express');
const router = express.Router();

// Mock treatments data
// Each treatment type will be associated with 3 doctors in treatmentDoctors
const treatmentDoctors = {
  'Panchakarma': [
    { id: 'D101', name: 'Dr. Ananya Iyer', specialty: 'Panchakarma Specialist', experienceYears: 12, rating: 4.9, contact: '+91 98000 11111' },
    { id: 'D102', name: 'Dr. Rohan Deshmukh', specialty: 'Detox & Rejuvenation', experienceYears: 10, rating: 4.8, contact: '+91 98000 22222' },
    { id: 'D103', name: 'Dr. Meera Patel', specialty: 'Ayurvedic Physician', experienceYears: 9, rating: 4.7, contact: '+91 98000 33333' }
  ],
  'Abhyanga': [
    { id: 'D201', name: 'Dr. Kavya Nair', specialty: 'Therapeutic Massage', experienceYears: 8, rating: 4.8, contact: '+91 98111 11111' },
    { id: 'D202', name: 'Dr. Arjun Rao', specialty: 'Musculoskeletal Care', experienceYears: 11, rating: 4.7, contact: '+91 98111 22222' },
    { id: 'D203', name: 'Dr. Sneha Kulkarni', specialty: 'Pain Management', experienceYears: 7, rating: 4.6, contact: '+91 98111 33333' }
  ],
  'Shirodhara': [
    { id: 'D301', name: 'Dr. Niharika Sharma', specialty: 'Stress & Sleep Disorders', experienceYears: 10, rating: 4.9, contact: '+91 98222 11111' },
    { id: 'D302', name: 'Dr. Vivek Menon', specialty: 'Neurological Wellness', experienceYears: 12, rating: 4.8, contact: '+91 98222 22222' },
    { id: 'D303', name: 'Dr. Priyanka Joshi', specialty: 'Mind-Body Balance', experienceYears: 9, rating: 4.7, contact: '+91 98222 33333' }
  ],
  'Udvartana': [
    { id: 'D401', name: 'Dr. Sagar Pawar', specialty: 'Metabolic Health', experienceYears: 8, rating: 4.7, contact: '+91 98333 11111' },
    { id: 'D402', name: 'Dr. Aishwarya G', specialty: 'Weight Management', experienceYears: 10, rating: 4.8, contact: '+91 98333 22222' },
    { id: 'D403', name: 'Dr. Harshita Jain', specialty: 'Skin & Detox', experienceYears: 6, rating: 4.6, contact: '+91 98333 33333' }
  ],
  'Nasya': [
    { id: 'D501', name: 'Dr. Ritu Kapoor', specialty: 'ENT & Respiratory', experienceYears: 9, rating: 4.7, contact: '+91 98444 11111' },
    { id: 'D502', name: 'Dr. Aman Gupta', specialty: 'Sinus & Allergy Care', experienceYears: 7, rating: 4.6, contact: '+91 98444 22222' },
    { id: 'D503', name: 'Dr. Neha Bansal', specialty: 'Head & Neck Therapy', experienceYears: 8, rating: 4.7, contact: '+91 98444 33333' }
  ],
  'Basti': [
    { id: 'D601', name: 'Dr. Kiran Shetty', specialty: 'Digestive Wellness', experienceYears: 11, rating: 4.8, contact: '+91 98555 11111' },
    { id: 'D602', name: 'Dr. Pooja Rao', specialty: 'Gut Health & Detox', experienceYears: 10, rating: 4.7, contact: '+91 98555 22222' },
    { id: 'D603', name: 'Dr. Mahesh I', specialty: 'Colon Therapy', experienceYears: 9, rating: 4.6, contact: '+91 98555 33333' }
  ]
};
const mockTreatments = [
  {
    id: 1,
    patientId: 'P001',
    type: 'Panchakarma',
    startDate: '2024-01-15',
    endDate: '2024-02-15',
    status: 'Active',
    sessions: 12,
    completedSessions: 8
  },
  {
    id: 2,
    patientId: 'P002',
    type: 'Abhyanga',
    startDate: '2024-01-10',
    endDate: '2024-01-25',
    status: 'Completed',
    sessions: 10,
    completedSessions: 10
  }
];

// List treatments with associated doctors (3 per type)
router.get('/', (req, res) => {
  const enriched = mockTreatments.map(t => ({
    ...t,
    doctors: treatmentDoctors[t.type] || []
  }));
  res.json({ success: true, treatments: enriched });
});

// Get all treatment-doctor mappings (specific route placed before '/:id')
router.get('/doctors', (req, res) => {
  res.json({ success: true, data: treatmentDoctors });
});

// Get doctors by treatment type (specific route placed before '/:id')
router.get('/type/:type/doctors', (req, res) => {
  const { type } = req.params;
  const doctors = treatmentDoctors[type] || [];
  if (doctors.length === 0) {
    return res.status(404).json({ success: false, message: 'No doctors found for this treatment type' });
  }
  res.json({ success: true, type, doctors });
});

router.get('/:id', (req, res) => {
  const treatment = mockTreatments.find(t => t.id === parseInt(req.params.id));
  if (treatment) {
    res.json({ success: true, treatment: { ...treatment, doctors: treatmentDoctors[treatment.type] || [] } });
  } else {
    res.status(404).json({ success: false, message: 'Treatment not found' });
  }
});

module.exports = router;
