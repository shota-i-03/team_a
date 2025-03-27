import { supabase } from "./supabase";

/**
 * Checks if a table exists in the Supabase database
 * @param tableName The name of the table to check
 * @returns Promise<boolean> True if the table exists, false otherwise
 */
export async function doesTableExist(tableName: string): Promise<boolean> {
  try {
    // Query the information schema to check if the table exists
    const { data, error } = await supabase.rpc('check_table_exists', {
      table_name: tableName
    });
    
    if (error) {
      // If the RPC function doesn't exist, fall back to a direct query attempt
      // This will generate a controlled error we can check
      try {
        await supabase.from(tableName).select('*').limit(1);
        return true;
      } catch (queryError: any) {
        // Check if the error is specifically about the table not existing
        return !(queryError.code === '42P01' || queryError.message?.includes('does not exist'));
      }
    }
    
    return !!data;
  } catch (error) {
    console.warn(`Error checking if table '${tableName}' exists:`, error);
    return false;
  }
}
