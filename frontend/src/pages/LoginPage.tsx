import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('pelanggan');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let res;
      if (isLogin) {
        res = await api.login(username, password);
      } else {
        res = await api.signup(username, password, role);
      }
      
      localStorage.setItem('dapur_token', res.token);
      localStorage.setItem('dapur_role', res.role);
      localStorage.setItem('dapur_username', res.username);
      
      if (res.role === 'admin') navigate('/admin');
      else if (res.role === 'staf_produksi') navigate('/staf');
      else navigate('/pelanggan');
    } catch (err: any) {
      alert(err.message || (isLogin ? 'Login gagal. Periksa username dan password Anda.' : 'Pendaftaran gagal.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="glass-card login-card">
        <div className="login-header">
          <h2>Dapur Ceu El</h2>
          <p>{isLogin ? 'Masuk ke akun Anda' : 'Buat akun baru'}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="form-stack">
          <div>
            <label>Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              placeholder="Username"
              required
              minLength={3}
            />
          </div>
          <div>
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
          
          {!isLogin && (
            <div className="role-selector">
              <label>Pilih Peran Anda</label>
              <div className="role-options">
                <label className={`role-card ${role === 'pelanggan' ? 'active' : ''}`}>
                  <input type="radio" name="role" value="pelanggan" checked={role === 'pelanggan'} onChange={() => setRole('pelanggan')} />
                  Pelanggan
                </label>
                <label className={`role-card ${role === 'staf_produksi' ? 'active' : ''}`}>
                  <input type="radio" name="role" value="staf_produksi" checked={role === 'staf_produksi'} onChange={() => setRole('staf_produksi')} />
                  Staf Produksi
                </label>
                <label className={`role-card ${role === 'admin' ? 'active' : ''}`}>
                  <input type="radio" name="role" value="admin" checked={role === 'admin'} onChange={() => setRole('admin')} />
                  Admin
                </label>
              </div>
            </div>
          )}
          
          <button type="submit" disabled={loading} className="primary-action btn-block" style={{ marginTop: '0.5rem' }}>
            {loading ? 'Memproses...' : (isLogin ? 'Masuk' : 'Daftar')}
          </button>
        </form>

        <div className="login-footer">
          {isLogin ? (
            <p>Belum punya akun? <button className="text-link" onClick={() => setIsLogin(false)}>Daftar di sini</button></p>
          ) : (
            <p>Sudah punya akun? <button className="text-link" onClick={() => setIsLogin(true)}>Masuk di sini</button></p>
          )}
        </div>
      </div>
    </div>
  );
}
