import {
  addDoc,
  collection,
  deleteField,
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

function buildBaseTransactionPayload(uid, values) {
  const payload = {
    uid,
    date: values.date,
    type: values.type,
    category: values.category.trim(),
    description: values.description.trim(),
    amount: Number(values.amount),
    updatedAt: serverTimestamp(),
  };

  if (values.receiptImageUrl) {
    payload.receiptImageUrl = values.receiptImageUrl;
  }

  if (values.receiptImagePath) {
    payload.receiptImagePath = values.receiptImagePath;
  }

  if (values.receiptOcrText) {
    payload.receiptOcrText = values.receiptOcrText;
  }

  return payload;
}

function buildTransactionUpdatePayload(uid, values) {
  const payload = buildBaseTransactionPayload(uid, values);

  if (!values.receiptImageUrl) {
    payload.receiptImageUrl = deleteField();
  }

  if (!values.receiptImagePath) {
    payload.receiptImagePath = deleteField();
  }

  if (!values.receiptOcrText) {
    payload.receiptOcrText = deleteField();
  }

  return payload;
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
  const payload = buildBaseTransactionPayload(uid, values);

  const docRef = await addDoc(transactionsCollection, {
    ...payload,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function updateTransaction(transactionId, uid, values) {
  await updateDoc(doc(db, 'transactions', transactionId), buildTransactionUpdatePayload(uid, values));
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
