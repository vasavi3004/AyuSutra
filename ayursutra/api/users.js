const mockUsers = [
  { id: 1, name: 'Dr. Ayurveda Sharma', email: 'doctor@ayursutra.com', role: 'practitioner' },
  { id: 2, name: 'Rajesh Kumar', email: 'patient@ayursutra.com', role: 'patient' }
];

export default function handler(req, res) {
  const { method, url } = req;
  // GET /api/users
  if (method === 'GET' && url.endsWith('/users')) {
    return res.status(200).json({ success: true, users: mockUsers });
  }
  // GET /api/users/:id
  const idMatch = url.match(/\/users\/(\d+)$/);
  if (method === 'GET' && idMatch) {
    const user = mockUsers.find(u => u.id === parseInt(idMatch[1]));
    if (user) {
      return res.status(200).json({ success: true, user });
    } else {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
  }
  // Default: Method not allowed or endpoint not found
  return res.status(404).json({ success: false, message: 'Endpoint not found or method not allowed' });
}
