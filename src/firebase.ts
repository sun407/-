import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  getDocFromServer, 
  setDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  updateDoc
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { ResumeData } from './types';

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firestore with Database ID (Critical: AI Studio custom DB ID)
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Connection test as required by Firebase integration guidelines
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase Firestore connection verified.');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

// 7 days in milliseconds (1 week photo retention policy)
export const PHOTO_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface CloudResumeRecord {
  id: string;
  userId: string;
  title: string;
  resumeData: ResumeData;
  photoUploadedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Check if a photo timestamp is expired (> 7 days).
 */
export function isPhotoExpired(photoUploadedAt?: string | null): boolean {
  if (!photoUploadedAt) return false;
  const uploadTime = new Date(photoUploadedAt).getTime();
  if (isNaN(uploadTime)) return false;
  return Date.now() - uploadTime > PHOTO_RETENTION_MS;
}

/**
 * Save or update a resume in Firestore.
 * Automatically enforces 1-week photo retention policy.
 */
export async function saveResumeToFirestore(
  userId: string,
  resumeId: string,
  title: string,
  resumeData: ResumeData,
  existingPhotoUploadedAt?: string | null
): Promise<CloudResumeRecord> {
  const path = `resumes/${resumeId}`;
  const now = new Date().toISOString();

  // Handle Photo uploaded timestamp and 1-week automatic expiration
  let photoUploadedAt: string | null = null;
  const clonedData: ResumeData = JSON.parse(JSON.stringify(resumeData));

  if (clonedData.personal.photoUrl) {
    // If it has existing timestamp, check if expired (> 7 days)
    const timestampToCheck = existingPhotoUploadedAt || now;
    if (isPhotoExpired(timestampToCheck)) {
      // Auto-remove expired photo
      clonedData.personal.photoUrl = null;
      photoUploadedAt = null;
    } else {
      photoUploadedAt = existingPhotoUploadedAt || now;
    }
  }

  const record: CloudResumeRecord = {
    id: resumeId,
    userId,
    title: title || clonedData.personal.name || '알기 쉬운 이력서',
    resumeData: clonedData,
    photoUploadedAt,
    createdAt: now,
    updatedAt: now,
  };

  try {
    const docRef = doc(db, 'resumes', resumeId);
    const existingSnap = await getDoc(docRef);
    if (existingSnap.exists()) {
      record.createdAt = existingSnap.data().createdAt || now;
    }
    await setDoc(docRef, record);
    return record;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Fetch all resumes for a user from Firestore.
 * Automatically inspects and removes photos older than 1 week (7 days).
 */
export async function fetchUserResumes(userId: string): Promise<{
  resumes: CloudResumeRecord[];
  cleanedPhotosCount: number;
}> {
  const collectionPath = 'resumes';
  try {
    const q = query(
      collection(db, collectionPath),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    const resumes: CloudResumeRecord[] = [];
    let cleanedPhotosCount = 0;

    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data() as CloudResumeRecord;
      data.id = docSnap.id;

      // Check if photo is expired (> 7 days / 1 week)
      if (data.resumeData?.personal?.photoUrl && isPhotoExpired(data.photoUploadedAt)) {
        // Automatically clean photo from database
        data.resumeData.personal.photoUrl = null;
        data.photoUploadedAt = null;
        cleanedPhotosCount++;

        // Async update in Firestore to persist photo cleanup
        try {
          await updateDoc(docSnap.ref, {
            'resumeData.personal.photoUrl': null,
            photoUploadedAt: null,
            updatedAt: new Date().toISOString(),
          });
        } catch (err) {
          console.warn('Failed to persist photo cleanup for doc', docSnap.id, err);
        }
      }

      resumes.push(data);
    }

    // Sort by updatedAt descending
    resumes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return { resumes, cleanedPhotosCount };
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collectionPath);
  }
}

/**
 * Delete a resume from Firestore.
 */
export async function deleteResumeFromFirestore(userId: string, resumeId: string): Promise<void> {
  const path = `resumes/${resumeId}`;
  try {
    const docRef = doc(db, 'resumes', resumeId);
    const snap = await getDoc(docRef);
    if (snap.exists() && snap.data().userId === userId) {
      await deleteDoc(docRef);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Manually trigger scanning and purging of expired photos (> 1 week) across all user resumes.
 */
export async function purgeExpiredPhotosNow(userId: string): Promise<number> {
  const { cleanedPhotosCount } = await fetchUserResumes(userId);
  return cleanedPhotosCount;
}

// Auth Helper Functions
export async function loginWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error('Google Sign In Error:', error);
    throw error;
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign Out Error:', error);
    throw error;
  }
}
