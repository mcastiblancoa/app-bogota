import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAOF3G03Mna7DY-zT_oo_1JejlpkFiuoLc",
  authDomain: "app-bogota-71708.firebaseapp.com",
  projectId: "app-bogota-71708",
  storageBucket: "app-bogota-71708.firebasestorage.app",
  messagingSenderId: "461083934664",
  appId: "1:461083934664:web:45b8c419a44820fe764afd"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Exportar todas las funciones necesarias
export { db, collection, addDoc, getDocs, deleteDoc, doc };