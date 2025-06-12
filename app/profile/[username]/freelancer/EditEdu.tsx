import { useState } from 'react';
import { supabase } from '@/app/lib/supabase';

export default function EditEdu({ userId, education, onUpdated }: {
  userId: string;
  education: any[];
  onUpdated: () => void;
}) {
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.from('education').insert({ ...form, user_id: userId });
      if (error) throw error;
      setForm({});
      onUpdated();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.from('education').delete().eq('id', id);
      if (error) throw error;
      onUpdated();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form className="space-y-2" onSubmit={e=>{e.preventDefault();handleAdd();}}>
        <select name="level" className="bg-gray-input text-base rounded px-4 py-2 w-full mb-2 focus:outline-none focus:ring-2 focus:ring-purple" onChange={handleChange} value={form.level||''} required>
  <option value="">Select Level</option>
  <option value="High School">High School</option>
  <option value="Diploma">Diploma</option>
  <option value="Bachelor">Bachelor</option>
  <option value="Master">Master</option>
  <option value="PhD">PhD</option>
  <option value="Other">Other</option>
</select>
        <input name="school" placeholder="School" className="bg-gray-input text-base rounded px-4 py-2 w-full mb-2 focus:outline-none focus:ring-2 focus:ring-purple" onChange={handleChange} value={form.school||''} required />
        <input name="course" placeholder="Course" className="bg-gray-input text-base rounded px-4 py-2 w-full mb-2 focus:outline-none focus:ring-2 focus:ring-purple" onChange={handleChange} value={form.course||''} required />
        <select name="start_year" className="bg-gray-input text-base rounded px-4 py-2 w-full mb-2 focus:outline-none focus:ring-2 focus:ring-purple" onChange={handleChange} value={form.start_year||''} required>
          <option value="">Start Year</option>
          {Array.from({length: (new Date().getFullYear()-1970+1)}, (_,i)=>1970+i).map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
        <select name="end_year" className="bg-gray-input text-base rounded px-4 py-2 w-full mb-2 focus:outline-none focus:ring-2 focus:ring-purple" onChange={handleChange} value={form.end_year||''}>
          <option value="">End Year (optional)</option>
          {(function() {
            const start = form.start_year ? parseInt(form.start_year, 10) : 1970;
            const end = new Date().getFullYear();
            return Array.from({length: end-start+1}, (_,i)=>start+i).map(year => (
              <option key={year} value={year}>{year}</option>
            ));
          })()}
        </select>
        <button type="submit" className="bg-purple text-white px-6 py-2 rounded hover:bg-purple-attention text-base font-semibold mt-2" disabled={loading}>{loading ? 'Saving...' : 'Add'}</button>
        {error && <div className="text-red-500">{error}</div>}
      </form>
      <div>
        <h3 className="font-semibold mb-2">Education List</h3>
        <ul className="space-y-2">
          {education.map((item:any)=>(
            <li key={item.id} className="flex justify-between items-center bg-gray-100 p-2 rounded">
              <span>{`${item.level} - ${item.school} (${item.start_year}${item.end_year?` - ${item.end_year}`:''})`}</span>
              <button onClick={()=>handleDelete(item.id)} className="text-red-600 hover:underline">Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
