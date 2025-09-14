import { initializeApp, getApp, getApps } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDVxVxycajNqVD-EhW0NblIvmeQte1LcPs",
  authDomain: "value-dns.firebaseapp.com",
  databaseURL: "https://value-dns-default-rtdb.firebaseio.com",
  projectId: "value-dns",
  storageBucket: "value-dns.firebasestorage.app",
  messagingSenderId: "820390879841",
  appId: "1:820390879841:web:336c9f23ca9ac6e2900020",
  measurementId: "G-8T8X612B14"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const database = getDatabase(app);

export { app, database };
