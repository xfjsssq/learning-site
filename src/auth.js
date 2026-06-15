let currentUser = null;
let authReady = true;
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
  return true;
}

export async function initAuth() {
  currentUser = { name: '本地用户' };
  authReady = true;
  notify();
}

export async function signUp() {
  return { user: { name: '本地用户' } };
}

export async function signIn() {
  return { user: { name: '本地用户' } };
}

export async function signInWithOAuth() {
  return { url: null };
}

export async function signOut() {
  // 纯本地模式不需要退出登录
}

export function isAuthReady() {
  return authReady;
}
