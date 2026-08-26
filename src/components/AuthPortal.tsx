import React, { useState } from 'react';
import { 
  User, 
  Building2, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Check, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { AuthUser, UserRole } from '../types';
import { MediConnectLogo } from './MediConnectLogo';

interface AuthPortalProps {
  onLogin: (user: AuthUser) => void;
}

export const AuthPortal: React.FC<AuthPortalProps> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Patient form fields
  const [patientEmail, setPatientEmail] = useState('patient@demo.com');
  const [patientPassword, setPatientPassword] = useState('password123');
  const [patientName, setPatientName] = useState('Sarah Jenkins');

  // Hospital form fields
  const [hospitalEmail, setHospitalEmail] = useState('admin@citycare.com');
  const [hospitalPassword, setHospitalPassword] = useState('password123');
  const [hospitalName, setHospitalName] = useState('City Care Multi-Specialty Hospital');
  const [adminName, setAdminName] = useState('Dr. Anand Rao (Chief Medical Officer)');

  const [errorMessage, setErrorMessage] = useState('');

  const handlePatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientEmail.trim() || !patientPassword.trim()) {
      setErrorMessage('Please enter email and password');
      return;
    }
    onLogin({
      role: 'patient',
      email: patientEmail,
      name: patientName || 'Patient User',
      phone: '+91 98765 43210',
    });
  };

  const handleHospitalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospitalEmail.trim() || !hospitalPassword.trim()) {
      setErrorMessage('Please enter hospital email and password');
      return;
    }
    onLogin({
      role: 'hospital',
      email: hospitalEmail,
      name: adminName || 'Hospital Administrator',
      hospitalName: hospitalName || 'City Care Hospital',
      phone: '+91 80 2345 6789',
    });
  };

  return (
    <div className="min-h-screen bg-[#07101d] text-white flex flex-col justify-between relative overflow-hidden font-sans selection:bg-teal-500 selection:text-white">
      
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <header className="w-full max-w-7xl mx-auto px-6 sm:px-8 pt-8 pb-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <MediConnectLogo size="md" animated={true} />
          <div>
            <div className="text-sm font-black tracking-widest text-white uppercase">
              MEDICONNECT
            </div>
            <div className="text-xs text-slate-400 font-medium">
              Healthcare visibility network
            </div>
          </div>
        </div>

        {/* Live Network Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Live Triage &amp; Bed Sync Active</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 sm:px-8 py-8 sm:py-12 flex items-center justify-center z-10">
        
        {/* VIEW 1: Portal Choice (Matching Image 1) */}
        {!selectedRole ? (
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-block text-xs font-extrabold tracking-widest text-[#00b289] uppercase">
                REAL-TIME CARE COORDINATION
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.08]">
                The right care, with visibility.
              </h1>
              <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-lg font-normal">
                MediConnect connects patients with hospitals and gives care teams a live view of beds, equipment, specialists, and emergency capacity.
              </p>
              
              <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                <span className="inline-flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00b289]" />
                  Verified Hospital Data
                </span>
                <span className="inline-flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  24/7 Ambulance Dispatch
                </span>
              </div>
            </div>

            {/* Right Side 2 Action Cards */}
            <div className="lg:col-span-6 flex flex-col gap-5 max-w-md mx-auto w-full lg:max-w-none">
              
              {/* Card 1: Continue as Patient (White card) */}
              <div
                id="portal-select-patient-card"
                onClick={() => setSelectedRole('patient')}
                className="group bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 flex flex-col justify-between min-h-[175px] cursor-pointer hover:scale-[1.02] hover:shadow-teal-500/10 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#e6f7f5] text-[#00b289] flex items-center justify-center shadow-xs">
                    <User className="w-6 h-6" />
                  </div>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-900 group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    Continue as Patient
                  </h3>
                  <p className="text-sm text-slate-500 font-medium mt-1">
                    Find hospitals, doctors, beds, and emergency resources near you.
                  </p>
                </div>
              </div>

              {/* Card 2: Hospital Login (Teal card) */}
              <div
                id="portal-select-hospital-card"
                onClick={() => setSelectedRole('hospital')}
                className="group bg-[#00b289] text-slate-950 rounded-3xl p-6 sm:p-8 shadow-2xl border border-teal-400/20 flex flex-col justify-between min-h-[175px] cursor-pointer hover:scale-[1.02] hover:shadow-teal-400/20 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-slate-950 text-[#00b289] flex items-center justify-center shadow-md">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-950 group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-2xl font-black text-slate-950 tracking-tight">
                    Hospital Login
                  </h3>
                  <p className="text-sm text-slate-900/80 font-semibold mt-1">
                    Manage hospital operations, resources, alerts, and emergency capacity.
                  </p>
                </div>
              </div>

            </div>

          </div>
        ) : selectedRole === 'patient' ? (
          /* VIEW 2: Patient Portal Login (Matching Image 2) */
          <div className="w-full max-w-md mx-auto">
            <div className="bg-white text-slate-800 rounded-3xl p-7 sm:p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
              
              {/* Back to Portal Choice */}
              <button
                id="btn-back-to-portal-choice"
                onClick={() => {
                  setSelectedRole(null);
                  setErrorMessage('');
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Choose another portal</span>
              </button>

              {/* Portal Header */}
              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#e6f7f5] text-[#00b289] flex items-center justify-center shadow-xs shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[11px] font-extrabold text-[#00a884] tracking-widest uppercase">
                    MEDICONNECT
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    Patient portal
                  </h2>
                </div>
              </div>

              {/* Segmented Toggle: Login / Register */}
              <div className="bg-slate-100/90 p-1 rounded-2xl flex items-center mb-5">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    authMode === 'login'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    authMode === 'register'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Register
                </button>
              </div>

              {errorMessage && (
                <div className="mb-4 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handlePatientSubmit} className="space-y-4">
                {authMode === 'register' && (
                  <div>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-hidden focus:border-[#00b289] focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                )}

                <div>
                  <input
                    type="email"
                    placeholder="Email"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-hidden focus:border-[#00b289] focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                <div>
                  <input
                    type="password"
                    placeholder="Password"
                    value={patientPassword}
                    onChange={(e) => setPatientPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-hidden focus:border-[#00b289] focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => alert('Password reset instructions sent to ' + patientEmail)}
                    className="text-xs font-semibold text-[#00a884] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  id="btn-login-patient-submit"
                  className="w-full py-3.5 px-4 rounded-2xl bg-[#00b289] hover:bg-[#009e7a] text-white font-bold text-sm shadow-md hover:shadow-lg shadow-teal-900/10 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>{authMode === 'login' ? 'Login securely' : 'Create Patient Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Demo Helper */}
              <div className="mt-5 pt-4 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setPatientEmail('patient@demo.com');
                    setPatientPassword('password123');
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors cursor-pointer"
                >
                  Demo: <span className="font-mono text-slate-700 font-semibold">patient@demo.com</span> / <span className="font-mono text-slate-700 font-semibold">password123</span>
                </button>
              </div>

            </div>
          </div>
        ) : (
          /* VIEW 3: Hospital Admin Portal Login (Matching Image 3) */
          <div className="w-full max-w-md mx-auto">
            <div className="bg-white text-slate-800 rounded-3xl p-7 sm:p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
              
              {/* Back to Portal Choice */}
              <button
                id="btn-back-to-portal-choice-hosp"
                onClick={() => {
                  setSelectedRole(null);
                  setErrorMessage('');
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Choose another portal</span>
              </button>

              {/* Portal Header */}
              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#e6f7f5] text-[#00b289] flex items-center justify-center shadow-xs shrink-0">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[11px] font-extrabold text-[#00a884] tracking-widest uppercase">
                    MEDICONNECT
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    Hospital admin portal
                  </h2>
                </div>
              </div>

              {/* Segmented Toggle: Login / Register */}
              <div className="bg-slate-100/90 p-1 rounded-2xl flex items-center mb-5">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    authMode === 'login'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    authMode === 'register'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Register
                </button>
              </div>

              {errorMessage && (
                <div className="mb-4 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleHospitalSubmit} className="space-y-4">
                {authMode === 'register' && (
                  <>
                    <div>
                      <input
                        type="text"
                        placeholder="Hospital Name"
                        value={hospitalName}
                        onChange={(e) => setHospitalName(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-hidden focus:border-[#00b289] focus:ring-2 focus:ring-teal-500/20"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Admin / Medical Officer Name"
                        value={adminName}
                        onChange={(e) => setAdminName(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-hidden focus:border-[#00b289] focus:ring-2 focus:ring-teal-500/20"
                      />
                    </div>
                  </>
                )}

                <div>
                  <input
                    type="email"
                    placeholder="Hospital email"
                    value={hospitalEmail}
                    onChange={(e) => setHospitalEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-hidden focus:border-[#00b289] focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                <div>
                  <input
                    type="password"
                    placeholder="Password"
                    value={hospitalPassword}
                    onChange={(e) => setHospitalPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-hidden focus:border-[#00b289] focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => alert('Password reset link sent to registered hospital admin: ' + hospitalEmail)}
                    className="text-xs font-semibold text-[#00a884] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  id="btn-login-hospital-submit"
                  className="w-full py-3.5 px-4 rounded-2xl bg-[#00b289] hover:bg-[#009e7a] text-white font-bold text-sm shadow-md hover:shadow-lg shadow-teal-900/10 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>{authMode === 'login' ? 'Login securely' : 'Register Hospital Facility'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Demo Helper */}
              <div className="mt-5 pt-4 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setHospitalEmail('admin@citycare.com');
                    setHospitalPassword('password123');
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors cursor-pointer"
                >
                  Demo: <span className="font-mono text-slate-700 font-semibold">admin@citycare.com</span> / <span className="font-mono text-slate-700 font-semibold">password123</span>
                </button>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 z-10">
        <div>
          &copy; {new Date().getFullYear()} MediConnect Healthcare Network. All rights reserved.
        </div>
        <div className="flex items-center gap-4">
          <span>Emergency Hotline: 108 / 112</span>
          <span>&bull;</span>
          <span>HIPAA &amp; NABH Certified</span>
        </div>
      </footer>

    </div>
  );
};
