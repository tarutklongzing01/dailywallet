import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase-config';
import { seedDefaultCategories } from './categoryService';

function buildProfilePayload(user) {
  return {
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || user.email?.split('@')[0] || 'ผู้ใช้ใหม่',
    photoURL: user.photoURL || '',
    provider: user.providerData?.[0]?.providerId || 'password',
    theme: 'light',
    updatedAt: serverTimestamp(),
  };
}

export async function bootstrapUserAccount(user) {
  if (!user) {
    return;
  }

  const userRef = doc(db, 'users', user.uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    await setDoc(userRef, {
      ...buildProfilePayload(user),
      createdAt: serverTimestamp(),
    });
  } else {
    await setDoc(userRef, buildProfilePayload(user), {
      merge: true,
    });
  }

  await seedDefaultCategories(user.uid);
}

export function subscribeToUserProfile(uid, onData, onError) {
  return onSnapshot(
    doc(db, 'users', uid),
    (snapshot) => {
      onData(snapshot.exists() ? snapshot.data() : null);
    },
    onError,
  );
}

export async function updateUserProfileData(uid, payload) {
  await updateDoc(doc(db, 'users', uid), {
    ...payload,
    updatedAt: serverTimestamp(),
  });
}
