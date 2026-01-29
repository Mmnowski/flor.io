import type { Database } from '~/types/database.types';

import type { SupabaseClient } from '@supabase/supabase-js';

// Type-safe table names
export type TableName = keyof Database['public']['Tables'];

// Generic type for table row data
export type Row<T extends TableName> = Database['public']['Tables'][T]['Row'];
export type Insert<T extends TableName> = Database['public']['Tables'][T]['Insert'];
export type Update<T extends TableName> = Database['public']['Tables'][T]['Update'];

/**
 * Fetch a single row from a table
 *
 * NOTE: Supabase's generic query builder has limitations with dynamic filtering.
 * We use .match() which properly handles Record<string, unknown> filters.
 * The cast is necessary due to Supabase's complex generic types.
 *
 * @param client - Supabase client instance
 * @param table - Table name
 * @param conditions - Filter conditions as key-value pairs
 * @returns Single row or null
 * @throws {Error} If multiple rows match the filter
 */
export async function fetchOne<T extends TableName>(
  client: SupabaseClient<Database>,
  table: T,
  conditions: Record<string, unknown>
): Promise<Row<T> | null> {
  // Cast needed: Supabase .match() is designed for this use case but types don't reflect it
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (client.from(table).select('*') as any).match(conditions).single();

  if (error?.code === 'PGRST116') {
    // No rows found - this is not an error
    return null;
  }

  if (error) {
    throw new Error(`Failed to fetch from ${table}: ${error.message}`);
  }

  return data as unknown as Row<T>;
}

/**
 * Fetch multiple rows from a table
 *
 * NOTE: Supabase's generic query builder has limitations with dynamic filtering.
 * We use .match() which properly handles Record<string, unknown> filters.
 *
 * @param client - Supabase client instance
 * @param table - Table name
 * @param conditions - Filter conditions as key-value pairs
 * @param options - Query options (limit, order, etc.)
 * @returns Array of rows
 */
export async function fetchMany<T extends TableName>(
  client: SupabaseClient<Database>,
  table: T,
  conditions: Record<string, unknown> = {},
  options?: {
    limit?: number;
    orderBy?: { column: string; ascending?: boolean };
  }
): Promise<Row<T>[]> {
  // Cast needed: Supabase .match() is designed for this use case but types don't reflect it
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (client.from(table).select('*') as any).match(conditions);

  // Apply ordering
  if (options?.orderBy) {
    query = query.order(options.orderBy.column, {
      ascending: options.orderBy.ascending ?? true,
    });
  }

  // Apply limit
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch from ${table}: ${error.message}`);
  }

  return (data || []) as unknown as Row<T>[];
}

/**
 * Insert a single row into a table
 *
 * @param client - Supabase client instance
 * @param table - Table name
 * @param row - Row data to insert
 * @returns Inserted row
 */
export async function insertOne<T extends TableName>(
  client: SupabaseClient<Database>,
  table: T,
  row: Insert<T>
): Promise<Row<T>> {
  // Cast needed: Insert() type is complex union but we know it's valid for the specific table
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (client.from(table) as any).insert(row).select().single();

  if (error) {
    throw new Error(`Failed to insert into ${table}: ${error.message}`);
  }

  return data as unknown as Row<T>;
}

/**
 * Update a single row in a table
 *
 * NOTE: Supabase's generic query builder has limitations with dynamic filtering.
 * We use .match() which properly handles Record<string, unknown> filters.
 *
 * @param client - Supabase client instance
 * @param table - Table name
 * @param conditions - Filter conditions to identify row to update
 * @param updates - Fields to update
 * @returns Updated row
 */
export async function updateOne<T extends TableName>(
  client: SupabaseClient<Database>,
  table: T,
  conditions: Record<string, unknown>,
  updates: Update<T>
): Promise<Row<T>> {
  // Cast needed: Update() type is complex union but we know it's valid for the specific table
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query = (client.from(table) as any).update(updates).match(conditions);

  const { data, error } = await query.select().single();

  if (error) {
    throw new Error(`Failed to update ${table}: ${error.message}`);
  }

  return data as unknown as Row<T>;
}

/**
 * Delete a single row from a table
 *
 * NOTE: Supabase's generic query builder has limitations with dynamic filtering.
 * We use .match() which properly handles Record<string, unknown> filters.
 *
 * @param client - Supabase client instance
 * @param table - Table name
 * @param conditions - Filter conditions to identify row to delete
 */
export async function deleteOne<T extends TableName>(
  client: SupabaseClient<Database>,
  table: T,
  conditions: Record<string, unknown>
): Promise<void> {
  // Cast needed: Supabase .match() is designed for this use case but types don't reflect it
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query = (client.from(table) as any).delete().match(conditions);

  const { error } = await query;

  if (error) {
    throw new Error(`Failed to delete from ${table}: ${error.message}`);
  }
}

/**
 * Call a Supabase RPC function
 *
 * @param client - Supabase client instance
 * @param functionName - RPC function name
 * @param args - Function arguments
 * @returns Function result
 */
export async function callRpc<T>(
  client: SupabaseClient<Database>,
  functionName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args: any = undefined
): Promise<T> {
  // Cast needed: RPC argument typing cannot be inferred from generic parameters
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (client.rpc(functionName, args) as any);

  if (error) {
    throw new Error(`RPC call ${functionName} failed: ${error.message}`);
  }

  return data as unknown as T;
}
