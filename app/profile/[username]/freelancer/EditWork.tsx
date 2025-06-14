'use client';
/* eslint-disable */
import { useState } from 'react';
import { supabase } from '@/app/lib/supabase';

export default function EditWork({
  userId,
  experience,
  onUpdated,
}: {
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
    <div className="space-y-6 bg-white p-6 rounded-xl shadow-md">
      <form
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          handleAdd();
        }}
      >
        <input
          name="company"
          placeholder="Company"
          className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple"
          onChange={handleChange}
          value={form.company || ''}
          required
        />
        <input
          name="position"
          placeholder="Position"
          className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple"
          onChange={handleChange}
          value={form.position || ''}
          required
        />
        <input
          name="start_date"
          type="date"
          className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple"
          onChange={handleChange}
          value={form.start_date || ''}
          required
        />
        <input
          name="end_date"
          type="date"
          className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple"
          onChange={handleChange}
          value={form.end_date || ''}
          min={form.start_date || undefined}
        />
        <textarea
          name="description"
          placeholder="Description (optional)"
          className="col-span-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple"
          rows={3}
          onChange={handleChange}
          value={form.description || ''}
        />
        <div className="col-span-full flex items-center justify-between mt-2">
          <button
            type="submit"
            className="bg-purple text-white px-6 py-2 rounded-lg hover:bg-purple-attention transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Add Experience'}
          </button>
          {error && <div className="text-red-500 text-sm">{error}</div>}
        </div>
      </form>

      <div>
        <h3 className="font-semibold text-lg mb-4">Experience</h3>
        {experience.length === 0 ? (
          <p className="text-gray-500">No experiences added yet.</p>
        ) : (
          <ul className="space-y-4">
            {experience.map((item: any) => (
              <li
                key={item.id}
                className="border border-gray-200 p-4 rounded-lg bg-gray-50 flex flex-col md:flex-row justify-between md:items-center"
              >
                <div>
                  <div className="font-medium text-gray-800">{item.position} at {item.company}</div>
                  <div className="text-sm text-gray-600">
                    {item.start_date} – {item.end_date || 'Present'}
                  </div>
                  {item.description && (
                    <p className="text-sm text-gray-700 mt-1">{item.description}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-red-600 mt-2 md:mt-0 md:ml-4 hover:underline text-sm"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
