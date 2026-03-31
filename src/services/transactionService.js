import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../config/firebase-config';
import { sortTransactions } from '../utils/transactionStats';

const transactionsCollection = collection(db, 'transactions');

function buildTransactionPayload(uid, values) {
  return {
    uid,
    date: values.date,
    type: values.type,
    category: values.category.trim(),
    description: values.description.trim(),
    amount: Number(values.amount),
    updatedAt: serverTimestamp(),
  };
}

export function subscribeToTransactions(uid, onData, onError) {
  const transactionQuery = query(transactionsCollection, where('uid', '==', uid));

  return onSnapshot(
    transactionQuery,
    (snapshot) => {
      const transactions = snapshot.docs.map((transactionDoc) => ({
        id: transactionDoc.id,
        ...transactionDoc.data(),
      }));

      onData(sortTransactions(transactions));
    },
    onError,
  );
}

export async function createTransaction(uid, values) {
  const payload = buildTransactionPayload(uid, values);

  const docRef = await addDoc(transactionsCollection, {
    ...payload,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function updateTransaction(transactionId, uid, values) {
  await updateDoc(doc(db, 'transactions', transactionId), buildTransactionPayload(uid, values));
}

export async function deleteTransaction(transactionId) {
  await deleteDoc(doc(db, 'transactions', transactionId));
}

export async function getTransactionById(transactionId) {
  const snapshot = await getDoc(doc(db, 'transactions', transactionId));

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

export async function seedMockTransactions(uid, mockTransactions) {
  const batch = writeBatch(db);

  mockTransactions.forEach((item) => {
    const transactionRef = doc(transactionsCollection);
    batch.set(transactionRef, {
      uid,
      type: item.type,
      category: item.category,
      description: item.description,
      amount: Number(item.amount),
      date: item.date,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });

  await batch.commit();
}
