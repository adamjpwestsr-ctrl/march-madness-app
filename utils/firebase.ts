// For Firebase JS SDK v7.20.0 and later, measurementId is optional

import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCEa-gvldQ2F_fZgFoYFbbD1weQzFU0qIw",
  authDomain: "bracketboss-2ccac.firebaseapp.com",
  projectId: "bracketboss-2ccac",
  storageBucket: "bracketboss-2ccac.firebasestorage.app",
  messagingSenderId: "444177997999",
  appId: "1:444177997999:web:4f5a069ceed4a56089b45a",
  measurementId: "G-Z9G63ZTZG9"
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);
