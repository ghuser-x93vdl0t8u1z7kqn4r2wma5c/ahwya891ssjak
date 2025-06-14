'use client';
/* eslint-disable */
import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';

export default function EditEdu({ userId, education, onUpdated }: {
  userId: string;
  education: any[];
  onUpdated: () => void;
}) {
  const [form, setForm] = useState({
    level: '',
    school: '',
    course: '',
    start_year: '',
    end_year: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form validation: required fields and end_year >= start_year (if provided)
  const isFormValid = form.level && form.school.trim() && form.course.trim() && form.start_year
    && (!form.end_year || Number(form.end_year) >= Number(form.start_year));

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError(null); // clear error on input change
  };

  const handleAdd = async () => {
    if (!isFormValid) {
      setError('Please fill all required fields correctly.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('education')
        .insert([{ ...form, user_id: userId }]);
      if (error) throw error;

      setForm({ level: '', school: '', course: '', start_year: '', end_year: '' });
      onUpdated();
    } catch (err: any) {
      setError(err.message || 'Failed to add education.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this education entry?');
    if (!confirmed) return;

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('education')
        .delete()
        .eq('id', id);
      if (error) throw error;

      onUpdated();
    } catch (err: any) {
      setError(err.message || 'Failed to delete education.');
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const startYear = form.start_year ? Number(form.start_year) : 1970;

  return (
    <section className="space-y-6 max-w-md mx-auto">
      <form
        className="space-y-3"
        onSubmit={e => {
          e.preventDefault();
          handleAdd();
        }}
        aria-label="Add education form"
      >
        <label className="block">
          <span className="text-gray-700 font-medium mb-1 block">Level *</span>
          <select
            name="level"
            className="bg-gray-input text-base rounded px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple border border-gray-300"
            onChange={handleChange}
            value={form.level}
            required
            disabled={loading}
          >
            <option value="">Select Level</option>
            <option value="High School">High School</option>
            <option value="Diploma">Diploma</option>
            <option value="Bachelor">Bachelor</option>
            <option value="Master">Master</option>
            <option value="PhD">PhD</option>
            <option value="Other">Other</option>
          </select>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium mb-1 block">School *</span>
          <input
            type="text"
            name="school"
            placeholder="School"
            className="bg-gray-input text-base rounded px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple border border-gray-300"
            onChange={handleChange}
            value={form.school}
            required
            disabled={loading}
            autoComplete="off"
          />
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium mb-1 block">Course *</span>
          <input
            type="text"
            name="course"
            placeholder="Course"
            className="bg-gray-input text-base rounded px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple border border-gray-300"
            onChange={handleChange}
            value={form.course}
            required
            disabled={loading}
            autoComplete="off"
          />
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium mb-1 block">Start Year *</span>
          <select
            name="start_year"
            className="bg-gray-input text-base rounded px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple border border-gray-300"
            onChange={handleChange}
            value={form.start_year}
            required
            disabled={loading}
          >
            <option value="">Start Year</option>
            {Array.from({ length: currentYear - 1970 + 1 }, (_, i) => 1970 + i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-gray-700 font-medium mb-1 block">End Year (optional)</span>
          <select
            name="end_year"
            className="bg-gray-input text-base rounded px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple border border-gray-300"
            onChange={handleChange}
            value={form.end_year}
            disabled={loading}
          >
            <option value="">End Year</option>
            {Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i)
              .map(year => (
                <option
                  key={year}
                  value={year}
                  disabled={year < startYear}
                >
                  {year}
                </option>
              ))}
          </select>
        </label>

        {error && <p className="text-red-600 text-sm font-semibold">{error}</p>}

        <button
          type="submit"
          className={`w-full bg-purple text-white px-6 py-2 rounded font-semibold transition hover:bg-purple-attention disabled:opacity-50`}
          disabled={!isFormValid || loading}
          aria-disabled={!isFormValid || loading}
        >
          {loading ? 'Saving...' : 'Add'}
        </button>
      </form>

      <section aria-label="Education list">
        <h3 className="font-semibold text-lg mb-2">Education List</h3>
        {education.length === 0 && (
          <p className="text-gray-500 italic">No education added yet.</p>
        )}
        <ul className="space-y-2 max-h-80 overflow-y-auto">
          {education.map((item: any) => (
            <li
              key={item.id}
              className="border border-gray-200 p-4 rounded-lg bg-gray-50 flex flex-col md:flex-row justify-between md:items-center"
            >
              <span>
                {`${item.level} - ${item.school} (${item.start_year}${item.end_year ? ` - ${item.end_year}` : ''})`}
              </span>
              <button
                onClick={() => handleDelete(item.id)}
                className="text-red-600 hover:underline focus:outline-none focus:ring-2 focus:ring-red-400 rounded px-2 py-1"
                aria-label={`Delete education entry: ${item.level} at ${item.school}`}
                disabled={loading}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}
