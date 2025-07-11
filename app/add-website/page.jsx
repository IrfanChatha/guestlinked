'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AddWebsite() {
  const [formData, setFormData] = useState({
    link: '',
    badge: '',
    category_1: '',
    category_2: '',
    category_3: '',
    price_from: '',
    price_to: '',
    similarweb_traffic: '',
    moz_da: '',
    semrush_as: '',
    ahrefs_dr_range: '',
    tat: '',
    link_attribution_type: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('web_sites').insert([formData]);
    if (error) alert('Error saving: ' + error.message);
    else alert('Website added successfully!');
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Add Website</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        {Object.keys(formData).map((field) => (
          <input
            key={field}
            name={field}
            value={formData[field]}
            onChange={handleChange}
            placeholder={field.replaceAll('_', ' ')}
            className="p-2 border rounded text-sm col-span-2"
          />
        ))}
        <button
          type="submit"
          className="col-span-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
