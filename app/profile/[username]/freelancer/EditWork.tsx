import { useState } from 'react';
import { supabase } from '@/app/lib/supabase';

export default function EditWork({ userId, experience, onUpdated }: {
  userId: string;
  experience: any[];
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
      const { error } = await supabase.from('work_experience').insert({ ...form, user_id: userId });
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
      const { error } = await supabase.from('work_experience').delete().eq('id', id);
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
        <input name="company" placeholder="Company" className="bg-gray-input text-base rounded px-4 py-2 w-full mb-2 focus:outline-none focus:ring-2 focus:ring-purple" onChange={handleChange} value={form.company||''} required />
        <input name="position" placeholder="Position" className="bg-gray-input text-base rounded px-4 py-2 w-full mb-2 focus:outline-none focus:ring-2 focus:ring-purple" onChange={handleChange} value={form.position||''} required />
        <input
          name="start_date"
          placeholder="Start Date"
          type="date"
          className="bg-gray-input text-base rounded px-4 py-2 w-full mb-2 focus:outline-none focus:ring-2 focus:ring-purple"
          onChange={handleChange}
          value={form.start_date || ''}
          required
        />
        <input
          name="end_date"
          placeholder="End Date (optional)"
          type="date"
          className="bg-gray-input text-base rounded px-4 py-2 w-full mb-2 focus:outline-none focus:ring-2 focus:ring-purple"
          onChange={handleChange}
          value={form.end_date || ''}
          min={form.start_date || undefined}
        />
        <textarea name="description" placeholder="Description (optional)" className="bg-gray-input text-base rounded px-4 py-2 w-full mb-2 focus:outline-none focus:ring-2 focus:ring-purple" onChange={handleChange} value={form.description||''} />
        <button type="submit" className="bg-purple text-white px-6 py-2 rounded hover:bg-purple-attention text-base font-semibold mt-2" disabled={loading}>{loading ? 'Saving...' : 'Add'}</button>
        {error && <div className="text-red-500">{error}</div>}
      </form>
      <div>
        <h3 className="font-semibold mb-2">Experience List</h3>
        <ul className="space-y-2">
          {experience.map((item:any)=>(
            <li key={item.id} className="flex justify-between items-center bg-gray-100 p-2 rounded">
              <span>{`${item.position} at ${item.company} (${item.start_date}${item.end_date?` - ${item.end_date}`:' - Present'})`}</span>
              <button onClick={()=>handleDelete(item.id)} className="text-red-600 hover:underline">Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
