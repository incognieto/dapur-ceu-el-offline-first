import { Bell } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

type Notification = {
  id: string;
  recipient_role: string;
  recipient_name?: string;
  type: string;
  message: string;
  read: boolean;
  created_at: string;
};

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const role = localStorage.getItem('dapur_role') || 'pelanggan';
  const username = localStorage.getItem('dapur_username') || '';

  const fetchNotifications = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/api/notifications?role=${role}`, {
        headers: {
          'X-Role': role,
          'X-Username': username
        }
      });
      if (res.ok) {
        let data = await res.json();
        // If it's pelanggan, filter by recipient_name if specified
        if (role === 'pelanggan') {
          data = data.filter((n: Notification) => n.recipient_name === username);
        }
        setNotifications(data);
      }
    } catch (e) {
      console.error('Failed to fetch notifications', e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // poll every 10s
    return () => clearInterval(interval);
  }, [role, username]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="notification-bell-container" ref={dropdownRef} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <button 
        type="button" 
        onClick={() => setIsOpen(!isOpen)} 
        style={{ background: 'transparent', border: 'none', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', padding: 0 }}
      >
        <Bell size={24} color="var(--color-text-main, #374151)" />
        {notifications.length > 0 && (
          <span style={{
            position: 'absolute', top: -5, right: -5, background: 'var(--color-danger, #ef4444)',
            color: 'white', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold'
          }}>
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: '10px', width: '300px',
          background: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000, overflow: 'hidden', border: '1px solid var(--color-border, #e5e7eb)'
        }}>
          <div style={{ padding: '10px 15px', borderBottom: '1px solid var(--color-border, #e5e7eb)', fontWeight: 'bold', color: '#000' }}>
            Notifikasi
          </div>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '15px', textAlign: 'center', color: 'var(--color-text-muted, #6b7280)' }}>Belum ada notifikasi baru</div>
            ) : (
              notifications.map(n => (
                <div key={n.id} style={{ padding: '10px 15px', borderBottom: '1px solid var(--color-border, #e5e7eb)' }}>
                  <div style={{ fontSize: '0.85rem', color: '#333' }}>{n.message}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted, #6b7280)', marginTop: '4px' }}>
                    {new Date(n.created_at).toLocaleString('id-ID')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
