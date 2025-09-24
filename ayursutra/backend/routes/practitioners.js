const express = require('express');
const router = express.Router();

// In-memory practitioners list (derived from treatments doctor mapping for demo)
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

const { getPatientsByPractitioner } = require('../data/practitionerPatients');

// List all practitioners (demo)
router.get('/', (req, res) => {
  res.json({ success: true, practitioners });
});

// Get specific practitioner by id
router.get('/:id', (req, res) => {
  const doc = practitioners.find(p => p.id === req.params.id);
  if (!doc) return res.status(404).json({ success: false, message: 'Practitioner not found' });
  res.json({ success: true, practitioner: doc });
});

// Get patients for a practitioner
router.get('/:id/patients', (req, res) => {
  const patients = getPatientsByPractitioner(req.params.id);
  res.json({ success: true, practitionerId: req.params.id, patients });
});

module.exports = router;
