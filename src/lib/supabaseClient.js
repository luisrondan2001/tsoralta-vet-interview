import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://encjobmeummrrfqsjyps.supabase.co';
const supabaseAnonKey = 'sb_publishable_zUKtaTWhe6J72XBP1iRvBQ_InRZc6_-';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


async function guardarEntrevistasEnSupabase(interviews) {
  try {
    const { data, error } = await supabase
      .from('entrevistas')
      .insert(Array.isArray(interviews) ? interviews : [interviews])
      .select();

    if (error) throw error;
    console.log('✅ Guardado en Supabase:', data);
  } catch (err) {
    console.error('❌ Error al guardar en Supabase:', err.message);
  }
}