// In-memory practitioner -> patients mapping for demo purposes
// This should be replaced by a proper database in production

const practitionerPatients = new Map(); // key: doctorId, value: array of patient objects

function addPatientToPractitioner(doctor, patient) {
  if (!doctor || !doctor.id) return;
  const key = doctor.id;
  const existing = practitionerPatients.get(key) || [];
  // Ensure unique by patient id
  const already = existing.some(p => p.id === patient.id);
  if (!already) {
    practitionerPatients.set(key, [...existing, patient]);
  }
}

function getPatientsByPractitioner(doctorId) {
  return practitionerPatients.get(doctorId) || [];
}

function clearAll() {
  practitionerPatients.clear();
}

module.exports = {
  addPatientToPractitioner,
  getPatientsByPractitioner,
  clearAll,
};
