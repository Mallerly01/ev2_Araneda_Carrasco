import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDew7S11dcKQ-sBhxEXgrt7Fs8orKosqaM",
  authDomain: "react-ev2-araneda-carrasco.firebaseapp.com",
  projectId: "react-ev2-araneda-carrasco",
  storageBucket: "react-ev2-araneda-carrasco.firebasestorage.app",
  messagingSenderId: "745672297780",
  appId: "1:745672297780:web:9234a69ea4d58ef2906961"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
