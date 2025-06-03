import { supabase } from './supabase';

export async function addToWaitlist(email: string) {
  const { error } = await supabase
    .from('waitlist')
    .insert([{ email, created_at: new Date().toISOString() }]);
  
  if (error) throw error;
}

export async function getWaitlistCount() {
  const { count, error } = await supabase
    .from('waitlist')
    .select('*', { count: 'exact' });
  
  if (error) throw error;
  return count || 0;
}

export async function getSkillsByCategory() {
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .order('category');
  
  if (error) throw error;
  return data;
}

export async function getHeroContent() {
  const { data, error } = await supabase
    .from('hero_content')
    .select('*')
    .single();
  
  if (error) throw error;
  return data;
} 