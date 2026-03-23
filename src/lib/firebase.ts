import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCBqHitkubiCKeZk2e5n7XfCkaUSuO3Z0A",
  authDomain: "stamp-journal.firebaseapp.com",
  projectId: "stamp-journal",
  storageBucket: "stamp-journal.firebasestorage.app",
  messagingSenderId: "428211006292",
  appId: "1:428211006292:web:788036a203e912f3b176c1",
  measurementId: "G-W08XMRD4WG"
};

const app = initializeApp(firebaseConfig);

isSupported().then((supported) => {
  if (supported) getAnalytics(app);
});

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export default app;
