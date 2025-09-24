const mockNotifications = [
  {
    id: 1,
    userId: 1,
    type: 'appointment_reminder',
    title: 'Appointment Reminder',
    message: 'You have an appointment tomorrow at 10:00 AM',
    read: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    userId: 2,
    type: 'treatment_update',
    title: 'Treatment Progress',
    message: 'Your Panchakarma treatment is progressing well',
    read: true,
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

export default function handler(req, res) {
  const { method, url } = req;
  // GET /api/notifications
  if (method === 'GET' && url.endsWith('/notifications')) {
    return res.status(200).json({ success: true, notifications: mockNotifications });
  }
  // GET /api/notifications/:id
  const idMatch = url.match(/\/notifications\/(\d+)$/);
  if (method === 'GET' && idMatch) {
    const notification = mockNotifications.find(n => n.id === parseInt(idMatch[1]));
    if (notification) {
      return res.status(200).json({ success: true, notification });
    } else {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
  }
  // PUT /api/notifications/:id/read
  const readMatch = url.match(/\/notifications\/(\d+)\/read$/);
  if (method === 'PUT' && readMatch) {
    const notification = mockNotifications.find(n => n.id === parseInt(readMatch[1]));
    if (notification) {
      notification.read = true;
      return res.status(200).json({ success: true, notification });
    } else {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
  }
  // Default: Method not allowed or endpoint not found
  return res.status(404).json({ success: false, message: 'Endpoint not found or method not allowed' });
}
