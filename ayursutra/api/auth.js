export default function handler(req, res) {
  const { method, url } = req;
  // POST /api/auth/login
  if (method === 'POST' && url.endsWith('/login')) {
    const { email, password } = req.body;
    const mockUsers = {
      'doctor@ayursutra.com': {
        id: 1,
        role: 'practitioner',
        name: 'Dr. Ayurveda Sharma',
        email: 'doctor@ayursutra.com'
      },
      'patient@ayursutra.com': {
        id: 2,
        role: 'patient',
        name: 'Rajesh Kumar',
        email: 'patient@ayursutra.com'
      }
    };
    if (mockUsers[email] && password === 'password123') {
      const user = mockUsers[email];
      return res.status(200).json({
        success: true,
        user,
        token: 'mock-jwt-token-' + user.id,
        refreshToken: 'mock-refresh-token-' + user.id
      });
    } else {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  }
  // POST /api/auth/register
  if (method === 'POST' && url.endsWith('/register')) {
    return res.status(200).json({
      success: true,
      message: 'User registered successfully',
      user: { id: Date.now(), ...req.body }
    });
  }
  // POST /api/auth/logout
  if (method === 'POST' && url.endsWith('/logout')) {
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  }
  // POST /api/auth/refresh
  if (method === 'POST' && url.endsWith('/refresh')) {
    return res.status(200).json({
      success: true,
      token: 'new-mock-jwt-token',
      refreshToken: 'new-mock-refresh-token'
    });
  }
  // Default: Method not allowed or endpoint not found
  return res.status(404).json({ success: false, message: 'Endpoint not found or method not allowed' });
}
