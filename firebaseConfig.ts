import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore, addDoc, collection, query, getDocs} from 'firebase/firestore';
//import { API_KEY } from '@env';

// import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
// import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIRESTORE_DB = getFirestore(FIREBASE_APP);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIREBASE_WRITE_TO_USER_DOC = async (username: string, exercise: string, weight: number, sets: number, year: number, month: number, day: number) => {
    console.log('Writing to firebase...');
    addDoc(collection(FIRESTORE_DB, username), {
        exercise: exercise, 
        weight: weight, 
        reps: sets, 
        date: {year: year, month: month, day: day}
    });
};
export const FIREBASE_READ_USER_DOC = async (username: string) => {
    const q = query(collection(FIRESTORE_DB, username));

    return getDocs(q)
};
// export const FIREBASE_AUTH = initializeAuth(FIREBASE_APP, {
//     persistence: getReactNativePersistence(ReactNativeAsyncStorage)
//   });
