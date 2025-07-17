import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database helper functions
export const db = {
  // Documents
  async insertDocument(document: any) {
    const { data, error } = await supabase
      .from('documents')
      .insert(document)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getDocuments() {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('upload_date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getDocumentById(id: string) {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Sections
  async insertSections(sections: any[]) {
    const { data, error } = await supabase
      .from('sections')
      .insert(sections)
      .select();
    
    if (error) throw error;
    return data;
  },

  async getSectionsByDocumentId(documentId: string) {
    const { data, error } = await supabase
      .from('sections')
      .select('*')
      .eq('document_id', documentId)
      .order('order_index');
    
    if (error) throw error;
    return data;
  },

  // Search functionality
  async searchContent(query: string) {
    const { data, error } = await supabase
      .from('sections')
      .select('*, documents(filename, upload_date)')
      .textSearch('content', query);
    
    if (error) throw error;
    return data;
  },

  async searchByTags(tags: string[]) {
    const { data, error } = await supabase
      .from('documents')
      .select('*, sections(*)')
      .overlaps('tags', tags);
    
    if (error) throw error;
    return data;
  }
};
