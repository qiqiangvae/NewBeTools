import React, { useState, useEffect } from 'react';
import { IconGlobe, IconSearch } from '../Icons';

const IpLookup: React.FC = () => {
  const [ip, setIp] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchIp = async (targetIp?: string) => {
    setLoading(true);
    setError('');
    setData(null);
    try {
        const url = targetIp ? `https://ipapi.co/${targetIp}/json/` : `https://ipapi.co/json/`;
        const res = await fetch(url);
        if(!res.ok) throw new Error("Failed to fetch data");
        const json = await res.json();
        setData(json);
        if(!targetIp) setIp(json.ip);
    } catch (e) {
        setError("Could not fetch IP data. Might be blocked by adblocker or rate limited.");
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
      fetchIp(); // Fetch own IP on mount
  }, []);

  return (
    <div className="flex flex-col gap-6 h-full">
      <h2 className="text-xl font-bold text-slate-100">IP Address Lookup</h2>

      <div className="flex gap-2">
          <input 
            type="text"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            placeholder="Enter IP Address (leave empty for My IP)"
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:ring-2 focus:ring-primary-500 outline-none font-mono"
          />
          <button 
             onClick={() => fetchIp(ip)} 
             className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
             <IconSearch className="w-4 h-4" />
             Lookup
          </button>
      </div>

      {loading && <div className="text-slate-400 text-center py-8">Loading...</div>}
      
      {error && <div className="text-red-400 text-center py-4 bg-red-900/20 rounded-lg border border-red-900/50">{error}</div>}

      {data && !loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4 col-span-full md:col-span-1">
                  <div className="flex items-center gap-3 mb-4">
                      <IconGlobe className="w-6 h-6 text-primary-400" />
                      <h3 className="text-lg font-semibold text-white">Network Info</h3>
                  </div>
                  <InfoRow label="IP Address" value={data.ip} />
                  <InfoRow label="Network" value={data.network} />
                  <InfoRow label="Version" value={data.version} />
                  <InfoRow label="ASN" value={data.asn} />
                  <InfoRow label="Org" value={data.org} />
              </div>

              <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4 col-span-full md:col-span-1">
                  <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-lg font-semibold text-white">Location</h3>
                  </div>
                  <InfoRow label="City" value={data.city} />
                  <InfoRow label="Region" value={data.region} />
                  <InfoRow label="Country" value={data.country_name} />
                  <InfoRow label="Timezone" value={data.timezone} />
                  <InfoRow label="Coordinates" value={`${data.latitude}, ${data.longitude}`} />
              </div>
          </div>
      )}
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string, value: string }) => (
    <div className="flex justify-between border-b border-slate-700 pb-2 last:border-0">
        <span className="text-slate-400 text-sm">{label}</span>
        <span className="text-slate-200 font-mono text-sm text-right">{value || '-'}</span>
    </div>
);

export default IpLookup;