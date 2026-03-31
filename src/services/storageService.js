import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '../config/firebase-config';

function sanitizeFileName(name = 'receipt') {
  return name.replace(/[^a-zA-Z0-9._-]/g, '-');
}

export async function uploadReceiptImage(uid, file) {
  if (!storage || !uid || !file) {
    return null;
  }

  const fileExtension = file.name?.split('.').pop() || 'jpg';
  const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExtension}`;
  const storagePath = `receipts/${uid}/${sanitizeFileName(fileName)}`;
  const storageRef = ref(storage, storagePath);

  await uploadBytes(storageRef, file, {
    contentType: file.type,
  });

  return {
    path: storagePath,
    url: await getDownloadURL(storageRef),
  };
}

export async function deleteReceiptImage(storagePath) {
  if (!storagePath || !storage) {
    return;
  }

  try {
    await deleteObject(ref(storage, storagePath));
  } catch (error) {
    if (error?.code !== 'storage/object-not-found') {
      throw error;
    }
  }
}
