import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase-config';
import { bootstrapUserAccount } from './profileService';

export async function registerWithEmail({ displayName, email, password }) {
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  await updateProfile(credential.user, {
    displayName: displayName.trim(),
  });
  await bootstrapUserAccount(auth.currentUser || credential.user);
  return credential.user;
}

export async function loginWithEmail({ email, password }) {
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
  return credential.user;
}

export async function loginWithGoogle() {
  const credential = await signInWithPopup(auth, googleProvider);
  await bootstrapUserAccount(credential.user);
  return credential.user;
}

export async function logoutUser() {
  await signOut(auth);
}
