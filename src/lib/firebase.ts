import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  Client,
  PurdueTest,
  ERSTest,
  BasicAcademicTest,
  IndividualizedServicePlan,
  SituationEvaluationLog,
  SemesterEvaluationData
} from '../types';

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// CRITICAL: getFirestore must pass the specific firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Error Handling Infrastructure per Firebase Integration Skill
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
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connectivity Test per Skill Guidelines
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore client is offline. Checking connection...");
    }
    return false;
  }
}

// Authentication Helpers
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
}

export async function signOutUser() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

// Collection References & Operations with strict handleFirestoreError wrapping

// 1. Clients
export async function saveClientToFirestore(client: Client): Promise<void> {
  const path = `clients/${client.id}`;
  try {
    await setDoc(doc(db, 'clients', client.id), client);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteClientFromFirestore(clientId: string): Promise<void> {
  const path = `clients/${clientId}`;
  try {
    await deleteDoc(doc(db, 'clients', clientId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeToClients(callback: (clients: Client[]) => void): Unsubscribe {
  const path = 'clients';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: Client[] = [];
      snapshot.forEach((d) => items.push(d.data() as Client));
      callback(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

// 2. Purdue Tests
export async function savePurdueTestToFirestore(test: PurdueTest): Promise<void> {
  const path = `purdueTests/${test.id}`;
  try {
    await setDoc(doc(db, 'purdueTests', test.id), test);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deletePurdueTestFromFirestore(testId: string): Promise<void> {
  const path = `purdueTests/${testId}`;
  try {
    await deleteDoc(doc(db, 'purdueTests', testId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeToPurdueTests(callback: (tests: PurdueTest[]) => void): Unsubscribe {
  const path = 'purdueTests';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: PurdueTest[] = [];
      snapshot.forEach((d) => items.push(d.data() as PurdueTest));
      callback(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

// 3. ERS Tests
export async function saveErsTestToFirestore(test: ERSTest): Promise<void> {
  const path = `ersTests/${test.id}`;
  try {
    await setDoc(doc(db, 'ersTests', test.id), test);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteErsTestFromFirestore(testId: string): Promise<void> {
  const path = `ersTests/${testId}`;
  try {
    await deleteDoc(doc(db, 'ersTests', testId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeToErsTests(callback: (tests: ERSTest[]) => void): Unsubscribe {
  const path = 'ersTests';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: ERSTest[] = [];
      snapshot.forEach((d) => items.push(d.data() as ERSTest));
      callback(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

// 4. Academic Tests
export async function saveAcademicTestToFirestore(test: BasicAcademicTest): Promise<void> {
  const path = `academicTests/${test.id}`;
  try {
    await setDoc(doc(db, 'academicTests', test.id), test);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteAcademicTestFromFirestore(testId: string): Promise<void> {
  const path = `academicTests/${testId}`;
  try {
    await deleteDoc(doc(db, 'academicTests', testId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeToAcademicTests(callback: (tests: BasicAcademicTest[]) => void): Unsubscribe {
  const path = 'academicTests';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: BasicAcademicTest[] = [];
      snapshot.forEach((d) => items.push(d.data() as BasicAcademicTest));
      callback(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

// 5. IPE / IWP Service Plans
export async function saveIwpPlanToFirestore(plan: IndividualizedServicePlan): Promise<void> {
  const path = `iwpPlans/${plan.id}`;
  try {
    await setDoc(doc(db, 'iwpPlans', plan.id), plan);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteIwpPlanFromFirestore(planId: string): Promise<void> {
  const path = `iwpPlans/${planId}`;
  try {
    await deleteDoc(doc(db, 'iwpPlans', planId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeToIwpPlans(callback: (plans: IndividualizedServicePlan[]) => void): Unsubscribe {
  const path = 'iwpPlans';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: IndividualizedServicePlan[] = [];
      snapshot.forEach((d) => items.push(d.data() as IndividualizedServicePlan));
      callback(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

// 6. Situation Evaluation Logs
export async function saveSituationLogToFirestore(log: SituationEvaluationLog): Promise<void> {
  const path = `situationLogs/${log.id}`;
  try {
    await setDoc(doc(db, 'situationLogs', log.id), log);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// 7. Semester Evaluation Data
export async function saveSemesterEvalToFirestore(evalData: SemesterEvaluationData): Promise<void> {
  const path = `semesterEvaluations/${evalData.id}`;
  try {
    await setDoc(doc(db, 'semesterEvaluations', evalData.id), evalData);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getSemesterEvalFromFirestore(id: string): Promise<SemesterEvaluationData | null> {
  const path = `semesterEvaluations/${id}`;
  try {
    const snap = await getDoc(doc(db, 'semesterEvaluations', id));
    if (snap.exists()) {
      return snap.data() as SemesterEvaluationData;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}
