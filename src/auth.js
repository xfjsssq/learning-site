import { getSupabaseClient } from './supabase.js';

let currentUser = null;
let authReady = false;
const listeners = new Set();

function notify() {
  listeners.forEach((fn) => fn(currentUser));
}

export function onAuthChange(callback) {
  listeners.add(callback);
  if (authReady) callback(currentUser);
  return () => listeners.delete(callback);
}

export function getCurrentUser() {
  return currentUser;
}

export function isAuthenticated() {
  return !!currentUser;
}

export async function initAuth() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    authReady = true;
    return;
  }

  const { data: { session } } = await supabase.auth.getSession();
  currentUser = session?.user ?? null;
  authReady = true;
  notify();

  supabase.auth.onAuthStateChange((_event, session) => {
    currentUser = session?.user ?? null;
    notify();
  });
}

export async function signUp(email, password) {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase 未配置');

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signIn(email, password) {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase 未配置');

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signInWithOAuth(provider) {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase 未配置');

  const redirectTo = `${window.location.origin}${import.meta.env.BASE_URL}auth/callback`;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  await supabase.auth.signOut();
  currentUser = null;
  notify();
}

export function isAuthReady() {
  return authReady;
}