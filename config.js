// config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyB5uV-DEhLXRS1HZSYKJ3TKLNKR6IyBl0w",
  authDomain: "hack-7b756.firebaseapp.com",
  projectId: "hack-7b756",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);