"use client";
import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Users, Car, Calendar, AlertTriangle, 
  LogOut, Clock, MapPin, Store, Video, PlusCircle, Package, Lock, ShieldCheck
} from 'lucide-react';

const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'missing-anon-key';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type SosRequest = {
  id: string;
  customer_name: string;
  issue: string;
  coordinates: string;
  status: string;
  profiles?: { phone_number?: string | null } | null;
};

type Booking = {
  id: string;
  service_type: string;
  notes?: string | null;
  booking_date?: string | null;
  booking_time?: string | null;
  status?: string | null;
  vehicles?: { model?: string | null; plate_number?: string | null } | null;
};

type Vehicle = {
  id: string;
  model: string;
  plate_number: string;
};

type ShowroomCar = {
  id: string;
  title: string;
  price: string;
  image_url: string;
};

type AcademyVideo = {
  id: string;
  title: string;
  description?: string | null;
  video_url: string;
};

type SparePart = {
  id: string;
  name: string;
  price: string;
  description?: string | null;
  image_url: string;
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Hitilafu imetokea.';

export default function AdminDashboard() {
  // 🔴 MFUMO WA USALAMA (SECURITY STATES)
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => typeof window !== 'undefined' && localStorage.getItem('motech_admin_auth') === 'true'
  );
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState('overview'); 
  const [loading, setLoading] = useState(false);
  
  // Data States
  const [stats, setStats] = useState({ users: 0, vehicles: 0, bookings: 0, sos: 0 });
  const [activeSos, setActiveSos] = useState<SosRequest[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  const [showroomCars, setShowroomCars] = useState<ShowroomCar[]>([]);
  const [academyVideos, setAcademyVideos] = useState<AcademyVideo[]>([]);
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  
  // Input States for New Car
  const [carTitle, setCarTitle] = useState('');
  const [carPrice, setCarPrice] = useState('');
  const [carImageFile, setCarImageFile] = useState<File | null>(null);
  const [isUploadingCar, setIsUploadingCar] = useState(false);

  // Input States for New Video
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDesc, setVideoDesc] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);

  // Input States for New Spare Part
  const [partName, setPartName] = useState('');
  const [partPrice, setPartPrice] = useState('');
  const [partDesc, setPartDesc] = useState('');
  const [partImageFile, setPartImageFile] = useState<File | null>(null);
  const [isUploadingPart, setIsUploadingPart] = useState(false);

  useEffect(() => {
    if (isAuthenticated) void fetchDashboardData();
  }, [isAuthenticated]);

  // 🔴 FUNKSHENI YA KUVERIFY PASSWORD YA ADMIN
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Unaweza kubadilisha hii password hapa chini kuwa unayotaka wewe
    if (adminPassword === 'motechadmin2026') { 
      setIsAuthenticated(true);
      setLoginError('');
      localStorage.setItem('motech_admin_auth', 'true');
      fetchDashboardData();
    } else {
      setLoginError('❌ Password si sahihi! Jaribu tena bosi.');
    }
  };

  const handleAdminLogout = () => {
    setIsAuthenticated(false);
    setAdminPassword('');
    localStorage.removeItem('motech_admin_auth');
  };

  async function fetchDashboardData() {
    if (!isSupabaseConfigured) {
      setLoading(false);
      alert('Supabase env haijawekwa. Tengeneza motech-admin/.env.local kutoka motech-admin/.env.example.');
      return;
    }

    setLoading(true);
    const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { count: vehicleCount } = await supabase.from('vehicles').select('*', { count: 'exact', head: true });
    const { count: bookingCount } = await supabase.from('bookings').select('*', { count: 'exact', head: true });
    
    // 🔴 TUNAVUTA SOS DATA PAMOJA NA NAMBA ZA SIMU ZA WATEJA KUTOKA PROFILES
    const { data: sosRequests } = await supabase.from('sos_requests').select('*, profiles(phone_number)').order('created_at', { ascending: false });
    const { data: latestBookings } = await supabase.from('bookings').select('*, vehicles(model, plate_number)').order('created_at', { ascending: false });
    const { data: vhs } = await supabase.from('vehicles').select('*').order('created_at', { ascending: false });
    const { data: cars } = await supabase.from('showroom').select('*').order('created_at', { ascending: false });
    const { data: vids } = await supabase.from('academy_videos').select('*').order('created_at', { ascending: false });
    const { data: parts } = await supabase.from('spare_parts').select('*').order('created_at', { ascending: false });

    setStats({ users: userCount || 0, vehicles: vehicleCount || 0, bookings: bookingCount || 0, sos: sosRequests?.filter(s => s.status === 'Pending').length || 0 });
    setActiveSos(sosRequests || []);
    setBookings(latestBookings || []);
    setAllVehicles(vhs || []);
    setShowroomCars(cars || []);
    setAcademyVideos(vids || []);
    setSpareParts(parts || []);
    setLoading(false);
  }

  const handleUploadCar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isSupabaseConfigured) return alert('Supabase env haijawekwa kwenye motech-admin/.env.local.');
    if (!carTitle || !carPrice || !carImageFile) return alert("Jaza jina, bei, na chagua picha ya gari!");
    setIsUploadingCar(true);
    try {
      const fileExt = carImageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `cars/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('showroom').upload(filePath, carImageFile);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('showroom').getPublicUrl(filePath);
      const { error: dbError } = await supabase.from('showroom').insert([{ title: carTitle, price: carPrice, image_url: publicUrl }]);
      if (dbError) throw dbError;
      setCarTitle(''); setCarPrice(''); setCarImageFile(null);
      (document.getElementById('carImageInput') as HTMLInputElement).value = ''; 
      fetchDashboardData();
      alert("✅ Gari limepakiwa Showroom!");
    } catch (error: unknown) { alert(`Kosa: ${getErrorMessage(error)}`); } finally { setIsUploadingCar(false); }
  };

  const handleUploadVideo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isSupabaseConfigured) return alert('Supabase env haijawekwa kwenye motech-admin/.env.local.');
    if (!videoTitle || !videoFile) return alert("Jaza Kichwa na chagua Video!");
    setIsUploadingVideo(true);
    try {
      const fileExt = videoFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `tutorials/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('academy').upload(filePath, videoFile);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('academy').getPublicUrl(filePath);
      const { error: dbError } = await supabase.from('academy_videos').insert([{ title: videoTitle, description: videoDesc, video_url: publicUrl }]);
      if (dbError) throw dbError;
      setVideoTitle(''); setVideoDesc(''); setVideoFile(null);
      (document.getElementById('videoFileInput') as HTMLInputElement).value = ''; 
      fetchDashboardData();
      alert("✅ Video imepakiwa Academy!");
    } catch (error: unknown) { alert(`Kosa: ${getErrorMessage(error)}`); } finally { setIsUploadingVideo(false); }
  };

  const handleUploadPart = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isSupabaseConfigured) return alert('Supabase env haijawekwa kwenye motech-admin/.env.local.');
    if (!partName || !partPrice || !partImageFile) return alert("Jaza jina, bei, na picha ya kipuri!");
    setIsUploadingPart(true);
    try {
      const fileExt = partImageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `parts/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('spare_parts').upload(filePath, partImageFile);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('spare_parts').getPublicUrl(filePath);
      const { error: dbError } = await supabase.from('spare_parts').insert([{ name: partName, price: partPrice, description: partDesc, image_url: publicUrl }]);
      if (dbError) throw dbError;
      setPartName(''); setPartPrice(''); setPartDesc(''); setPartImageFile(null);
      (document.getElementById('partImageInput') as HTMLInputElement).value = ''; 
      fetchDashboardData();
      alert("✅ Kipuri kimepakiwa Dukani!");
    } catch (error: unknown) { alert(`Kosa: ${getErrorMessage(error)}`); } finally { setIsUploadingPart(false); }
  };

  const updateStatus = async (table: string, id: string, status: string) => {
    if (!isSupabaseConfigured) return alert('Supabase env haijawekwa kwenye motech-admin/.env.local.');
    await supabase.from(table).update({ status: status }).eq('id', id);
    fetchDashboardData(); 
  };

  // ==========================================
  // RENDER SECURITY LOGIN SCREEN FIRST
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#070b12] flex items-center justify-center font-sans p-4">
        <form onSubmit={handleAdminLogin} className="w-full max-w-md bg-[#111a2a] border border-[#1e293b] rounded-3xl p-8 shadow-2xl text-center">
          <div className="w-20 h-20 bg-red-600/10 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
            <Lock size={40} />
          </div>
          <h2 className="text-2xl font-black mb-2 text-white">Mo<span className="text-red-600">TECH</span>-i Admin Gateway</h2>
          <p className="text-gray-400 text-sm mb-6">Mfumo huu unalindwa na Security. Ingiza ufunguo wa utawala kuendelea.</p>
          
          <div className="text-left mb-6">
            <label className="block text-xs font-bold uppercase text-gray-400 mb-2">Admin Password</label>
            <input 
              type="password" 
              placeholder="••••••••••••" 
              value={adminPassword} 
              onChange={e => setAdminPassword(e.target.value)} 
              className="w-full bg-[#070b12] border border-[#1e293b] p-4 rounded-xl text-white outline-none focus:border-red-600 transition" 
              required 
            />
          </div>

          {loginError && <p className="text-red-500 text-sm font-semibold mb-4">{loginError}</p>}

          <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl transition flex justify-center items-center gap-2 shadow-lg shadow-red-600/20">
            <ShieldCheck size={20}/> Unlock Dashboard
          </button>
        </form>
      </div>
    );
  }

  // ==========================================
  // MAIN MAIN SCREEN (IF LOGGED IN SUCCESSFULLY)
  // ==========================================
  const menuItems = [
    { id: 'overview', icon: <Users size={20} />, label: 'Overview' },
    { id: 'bookings', icon: <Calendar size={20} />, label: 'Service Bookings' },
    { id: 'sos', icon: <AlertTriangle size={20} />, label: 'Emergency (SOS)' },
    { id: 'vehicles', icon: <Car size={20} />, label: 'Client Garage' },
    { id: 'showroom', icon: <Store size={20} />, label: 'Manage Showroom' },
    { id: 'spare_parts', icon: <Package size={20} />, label: 'Manage Spares' },
    { id: 'academy', icon: <Video size={20} />, label: 'Manage Academy' },
  ];

  return (
    <div className="min-h-screen bg-[#070b12] text-white flex font-sans">
      {/* SIDEBAR */}
      <div className="w-64 bg-[#111a2a] border-r border-[#1e293b] p-6 flex flex-col">
        <h1 className="text-2xl font-black mb-10 text-white">Mo<span className="text-red-600">TECH</span>-i</h1>
        <nav className="flex-1 space-y-2">
          {menuItems.map(item => (
            <div key={item.id} onClick={() => setActiveTab(item.id)} className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition ${activeTab === item.id ? 'bg-red-600/10 text-red-600 font-bold' : 'text-gray-400 hover:bg-[#1e293b]'}`}>
              {item.icon} <span>{item.label}</span>
            </div>
          ))}
        </nav>
        <div className="mt-auto pt-6 border-t border-[#1e293b] space-y-2 text-gray-400">
          <div onClick={handleAdminLogout} className="flex items-center space-x-3 p-3 hover:text-red-500 cursor-pointer transition"><LogOut size={20} /> <span>Lock Dashboard</span></div>
        </div>
      </div>

      {/* BODY CONTENT */}
      <div className="flex-1 p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div><h2 className="text-3xl font-black capitalize">{activeTab.replace('_', ' ')}</h2></div>
          <button onClick={fetchDashboardData} disabled={loading} className="bg-[#111a2a] border border-[#1e293b] hover:bg-[#1e293b] px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition disabled:opacity-60"><Clock size={16} /> {loading ? 'Loading...' : 'Refresh Data'}</button>
        </header>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-4 gap-6 mb-10">
            <StatCard icon={<Users className="text-blue-500" />} label="Total Users" value={stats.users} />
            <StatCard icon={<Car className="text-purple-500" />} label="Registered Cars" value={stats.vehicles} />
            <StatCard icon={<Calendar className="text-green-500" />} label="Total Bookings" value={stats.bookings} />
            <StatCard icon={<AlertTriangle className="text-red-500" />} label="Pending SOS" value={stats.sos} highlight />
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bg-[#111a2a] rounded-3xl p-8 border border-[#1e293b]">
            <h3 className="text-xl font-black mb-6 flex items-center gap-2"><Calendar className="text-blue-500"/> Manage Client Bookings</h3>
            {bookings.length === 0 ? (
              <p className="text-gray-500 italic">Hakuna Service Bookings kwa sasa.</p>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-400 border-b border-[#1e293b]">
                    <th className="pb-4">Service Required</th>
                    <th className="pb-4">Vehicle Details</th>
                    <th className="pb-4">Schedule Date/Time</th>
                    <th className="pb-4">Status</th>
                    <th className="pb-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.id} className="border-b border-[#1e293b] hover:bg-[#1e293b]/50">
                      <td className="py-4 font-bold">{b.service_type}<br/><span className="text-xs text-gray-500 font-normal">{b.notes}</span></td>
                      <td className="py-4 text-sm text-gray-300">{b.vehicles?.model}<br/><span className="text-xs text-gray-500">{b.vehicles?.plate_number}</span></td>
                      <td className="py-4 text-sm">{b.booking_date} <br/><span className="text-gray-400">{b.booking_time}</span></td>
                      <td className="py-4">
                        <span className={`text-xs px-3 py-1 rounded-full ${
                          b.status === 'Completed' ? 'bg-green-600/10 text-green-500' : 
                          b.status === 'In Progress' ? 'bg-orange-600/10 text-orange-500' : 
                          'bg-blue-600/10 text-blue-500'
                        }`}>{b.status || 'Pending'}</span>
                      </td>
                      <td className="py-4 flex gap-2">
                        {(!b.status || b.status === 'Pending') && (
                          <button onClick={() => updateStatus('bookings', b.id, 'In Progress')} className="bg-orange-600/20 text-orange-500 border border-orange-600/30 text-xs px-3 py-1.5 rounded-lg hover:bg-orange-600 hover:text-white transition">Start Job</button>
                        )}
                        {b.status !== 'Completed' && (
                          <button onClick={() => updateStatus('bookings', b.id, 'Completed')} className="bg-green-600/20 text-green-500 border border-green-600/30 text-xs px-3 py-1.5 rounded-lg hover:bg-green-600 hover:text-white transition">Complete</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ===================== 🔴 EMERGENCY SOS TAB YENYE MABADILIKO YA REAL LOCATION NA SIMU ===================== */}
        {activeTab === 'sos' && (
          <div className="space-y-4">
            <h3 className="text-xl font-black mb-6 flex items-center gap-2"><AlertTriangle className="text-red-500"/> Emergency Rescue Alerts (Live)</h3>
            {activeSos.length === 0 ? (
              <p className="text-gray-500 italic">Hakuna SOS Requests. Kila kitu kipo shwari.</p>
            ) : (
              activeSos.map(sos => (
                <div key={sos.id} className={`p-6 rounded-2xl border ${sos.status === 'Pending' ? 'bg-red-600/10 border-red-600/30 shadow-lg shadow-red-600/5' : 'bg-[#111a2a] border-[#1e293b]'} flex justify-between items-center`}>
                  <div className="space-y-1">
                    <h3 className="text-xl font-black">{sos.customer_name}</h3>
                    <p className="text-red-400 font-bold text-lg">🚨 Shida: {sos.issue}</p>
                    
                    {/* 🔴 INASOMA NAMBA HALISI YA SIMU KUTOKA KWENYE PROFILES YA SUPABASE */}
                    <p className="text-gray-300 font-bold text-sm mt-2">
                      📞 Namba ya Simu: <span className="text-green-400 select-all">{sos.profiles?.phone_number || 'Haipo kwenye fomu'}</span>
                    </p>

                    {/* 🔴 INAGEUZA MAP COORDINATES KUWA LIVE LINK YA GOOGLE MAPS */}
                    <div className="pt-2">
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${sos.coordinates}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="bg-[#070b12] border border-[#1e293b] text-blue-400 hover:text-white hover:bg-blue-600 px-4 py-2 rounded-xl text-xs font-black inline-flex items-center gap-2 transition"
                      >
                        <MapPin size={14} className="text-red-500"/> View Real Location on Google Maps
                      </a>
                    </div>
                  </div>
                  <div>
                    {sos.status === 'Pending' ? (
                      <button onClick={() => updateStatus('sos_requests', sos.id, 'Rescued')} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition shadow-lg shadow-red-600/20">Mark Rescued</button>
                    ) : (
                      <span className="text-green-500 font-bold bg-green-600/10 border border-green-500/20 px-4 py-2 rounded-lg text-sm">Rescued / Resolved</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'vehicles' && (
          <div>
            <h3 className="text-xl font-black mb-6 flex items-center gap-2"><Car className="text-purple-500"/> All Client Vehicles</h3>
            <div className="grid grid-cols-3 gap-6">
              {allVehicles.length === 0 ? (
                <p className="text-gray-500 italic">Hakuna magari yaliyosajiliwa kwenye mfumo.</p>
              ) : (
                allVehicles.map(v => (
                  <div key={v.id} className="bg-[#111a2a] p-6 rounded-3xl border border-[#1e293b] flex items-center gap-4">
                    <div className="w-16 h-16 bg-[#070b12] rounded-2xl flex items-center justify-center"><Car className="text-purple-500" size={30} /></div>
                    <div>
                      <h3 className="font-bold text-lg">{v.model}</h3>
                      <p className="text-gray-400 text-sm font-bold bg-[#070b12] px-2 py-1 rounded mt-1 inline-block">{v.plate_number}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'showroom' && (
          <div className="flex gap-10 items-start">
            <form onSubmit={handleUploadCar} className="w-1/3 bg-[#111a2a] p-8 rounded-3xl border border-[#1e293b]">
              <h3 className="text-xl font-black mb-6 flex items-center gap-2"><PlusCircle size={20} className="text-blue-500"/> Add New Car</h3>
              <input type="text" placeholder="Car Title" value={carTitle} onChange={e => setCarTitle(e.target.value)} className="w-full mb-4 bg-[#070b12] border border-[#1e293b] p-4 rounded-xl text-white outline-none" required />
              <input type="text" placeholder="Price" value={carPrice} onChange={e => setCarPrice(e.target.value)} className="w-full mb-4 bg-[#070b12] border border-[#1e293b] p-4 rounded-xl text-white outline-none" required />
              <input id="carImageInput" type="file" accept="image/*" onChange={e => setCarImageFile(e.target.files?.[0] || null)} className="w-full mb-6 bg-[#070b12] border border-[#1e293b] p-3 rounded-xl text-white outline-none" required />
              <button type="submit" disabled={isUploadingCar} className="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-xl font-bold transition flex justify-center items-center gap-2">
                {isUploadingCar ? 'Uploading...' : 'Publish to Showroom'}
              </button>
            </form>
            <div className="flex-1 grid grid-cols-2 gap-6">
              {showroomCars.map(car => (
                <div key={car.id} className="bg-[#111a2a] rounded-3xl overflow-hidden border border-[#1e293b]"><img src={car.image_url} alt={car.title} className="w-full h-40 object-cover" /><div className="p-4"><h4 className="font-bold text-lg">{car.title}</h4><p className="text-blue-500 font-bold">{car.price}</p></div></div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'spare_parts' && (
          <div className="flex gap-10 items-start">
            <form onSubmit={handleUploadPart} className="w-1/3 bg-[#111a2a] p-8 rounded-3xl border border-[#1e293b]">
              <h3 className="text-xl font-black mb-6 flex items-center gap-2"><Package size={20} className="text-orange-500"/> Add Spare Part</h3>
              <label className="block text-sm text-gray-400 mb-2">Part Name</label>
              <input type="text" placeholder="e.g. Brake Pads (Toyota)" value={partName} onChange={e => setPartName(e.target.value)} className="w-full mb-4 bg-[#070b12] border border-[#1e293b] p-4 rounded-xl text-white outline-none" required />
              <label className="block text-sm text-gray-400 mb-2">Price</label>
              <input type="text" placeholder="e.g. TZS 85,000" value={partPrice} onChange={e => setPartPrice(e.target.value)} className="w-full mb-4 bg-[#070b12] border border-[#1e293b] p-4 rounded-xl text-white outline-none" required />
              <label className="block text-sm text-gray-400 mb-2">Description</label>
              <textarea placeholder="Short details about the part..." value={partDesc} onChange={e => setPartDesc(e.target.value)} className="w-full mb-4 bg-[#070b12] border border-[#1e293b] p-4 rounded-xl text-white outline-none h-20" />
              <label className="block text-sm text-gray-400 mb-2">Upload Part Image</label>
              <input id="partImageInput" type="file" accept="image/*" onChange={e => setPartImageFile(e.target.files?.[0] || null)} className="w-full mb-6 bg-[#070b12] border border-[#1e293b] p-3 rounded-xl text-white outline-none" required />
              <button type="submit" disabled={isUploadingPart} className="w-full bg-orange-600 hover:bg-orange-700 py-4 rounded-xl font-bold transition flex justify-center items-center gap-2">
                {isUploadingPart ? 'Uploading...' : 'Publish to Store'}
              </button>
            </form>
            <div className="flex-1 grid grid-cols-2 gap-6">
              {spareParts.map(part => (
                <div key={part.id} className="bg-[#111a2a] rounded-3xl overflow-hidden border border-[#1e293b] flex flex-col">
                  <img src={part.image_url} alt={part.name} className="w-full h-40 object-cover bg-white" />
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div><h4 className="font-bold text-lg leading-tight">{part.name}</h4><p className="text-xs text-gray-400 mt-1 line-clamp-2">{part.description}</p></div>
                    <p className="text-orange-500 font-black mt-3">{part.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'academy' && (
          <div className="flex gap-10 items-start">
            <form onSubmit={handleUploadVideo} className="w-1/3 bg-[#111a2a] p-8 rounded-3xl border border-[#1e293b]">
              <h3 className="text-xl font-black mb-6 flex items-center gap-2"><Video size={20} className="text-purple-500"/> Upload Tutorial</h3>
              <input type="text" placeholder="Video Title" value={videoTitle} onChange={e => setVideoTitle(e.target.value)} className="w-full mb-4 bg-[#070b12] border border-[#1e293b] p-4 rounded-xl text-white outline-none" required />
              <textarea placeholder="Description" value={videoDesc} onChange={e => setVideoDesc(e.target.value)} className="w-full mb-4 bg-[#070b12] border border-[#1e293b] p-4 rounded-xl text-white outline-none h-24" />
              <input id="videoFileInput" type="file" accept="video/*" onChange={e => setVideoFile(e.target.files?.[0] || null)} className="w-full mb-6 bg-[#070b12] border border-[#1e293b] p-3 rounded-xl text-white outline-none" required />
              <button type="submit" disabled={isUploadingVideo} className="w-full bg-purple-600 hover:bg-purple-700 py-4 rounded-xl font-bold transition flex justify-center items-center gap-2">
                {isUploadingVideo ? 'Uploading...' : 'Publish to Academy'}
              </button>
            </form>
            <div className="flex-1 grid grid-cols-2 gap-6">
              {academyVideos.map(vid => (
                <div key={vid.id} className="bg-[#111a2a] p-6 rounded-3xl border border-[#1e293b]">
                  <div className="w-full h-32 bg-[#070b12] rounded-xl mb-4 flex items-center justify-center overflow-hidden border border-[#1e293b]">
                    <video src={vid.video_url} className="w-full h-full object-cover" controls />
                  </div>
                  <h4 className="font-bold text-lg leading-tight">{vid.title}</h4>
                  <p className="text-sm text-gray-400 mt-1 truncate">{vid.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function StatCard({ icon, label, value, highlight = false }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div className={`p-6 rounded-3xl border border-[#1e293b] ${highlight ? 'bg-red-600/10 border-red-600/30' : 'bg-[#111a2a]'}`}>
      <div className="w-12 h-12 bg-[#070b12] rounded-2xl flex items-center justify-center mb-4">{icon}</div>
      <p className="text-gray-400 text-sm font-medium">{label}</p>
      <p className="text-3xl font-black mt-1">{value}</p>
    </div>
  );
}
