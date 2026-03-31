import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../config/firebase-config';
import { DEFAULT_CATEGORIES, TRANSACTION_TYPES } from '../constants/categories';

const categoriesCollection = collection(db, 'categories');

function normalizeCategoryName(name = '') {
  return name.trim();
}

function sortCategories(categories) {
  return [...categories].sort((left, right) => {
    const typeDiff = TRANSACTION_TYPES.indexOf(left.type) - TRANSACTION_TYPES.indexOf(right.type);
    if (typeDiff !== 0) {
      return typeDiff;
    }

    return left.name.localeCompare(right.name, 'th');
  });
}

export function subscribeToCategories(uid, onData, onError) {
  const categoryQuery = query(categoriesCollection, where('uid', '==', uid));

  return onSnapshot(
    categoryQuery,
    (snapshot) => {
      const categories = snapshot.docs.map((categoryDoc) => ({
        id: categoryDoc.id,
        ...categoryDoc.data(),
      }));

      onData(sortCategories(categories));
    },
    onError,
  );
}

export async function seedDefaultCategories(uid) {
  const existingSnapshot = await getDocs(query(categoriesCollection, where('uid', '==', uid)));

  if (!existingSnapshot.empty) {
    return;
  }

  const batch = writeBatch(db);

  Object.entries(DEFAULT_CATEGORIES).forEach(([type, names]) => {
    names.forEach((name) => {
      const categoryRef = doc(categoriesCollection);
      batch.set(categoryRef, {
        uid,
        type,
        name,
        isDefault: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });
  });

  await batch.commit();
}

export async function createCategory({ uid, type, name, isDefault = false }) {
  const normalized = normalizeCategoryName(name);
  const existingSnapshot = await getDocs(query(categoriesCollection, where('uid', '==', uid)));

  const existingCategory = existingSnapshot.docs
    .map((categoryDoc) => ({
      id: categoryDoc.id,
      ...categoryDoc.data(),
    }))
    .find(
      (item) =>
        item.type === type &&
        item.name.toLowerCase() === normalized.toLowerCase(),
    );

  if (existingCategory) {
    return existingCategory;
  }

  const docRef = await addDoc(categoriesCollection, {
    uid,
    type,
    name: normalized,
    isDefault,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return {
    id: docRef.id,
    uid,
    type,
    name: normalized,
    isDefault,
  };
}

export async function ensureCategoryExists(uid, type, name) {
  if (!name?.trim()) {
    return null;
  }

  return createCategory({
    uid,
    type,
    name,
  });
}
