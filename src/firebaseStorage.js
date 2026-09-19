// This file connects GeoAdventure to a real, shared cloud database (Firebase
// Firestore) so every student and the teacher — on any device, anywhere —
// see the same live data. It works by recreating the same small
// window.storage.get/set/delete/list API the app already uses, just backed
// by Firestore instead of Claude's local preview storage. Nothing else in
// App.jsx had to change.
//
// SETUP (one-time, ~5 minutes):
// 1. Go to https://console.firebase.google.com and create a free project.
// 2. In the project, click "Build > Firestore Database" > "Create database"
//    > start in TEST MODE (or use the security rule below).
// 3. Click the gear icon > "Project settings" > scroll to "Your apps" >
//    click the </> (web) icon > register an app (nickname can be anything).
// 4. Firebase shows you a firebaseConfig object — copy those values into
//    the object below, replacing the placeholder strings.
// 5. In Firestore > Rules, paste this (fine for a classroom project; it
//    keeps the database open to anyone who has your app's web address):
//
//    rules_version = '2';
//    service cloud.firestore {
//      match /databases/{database}/documents {
//        match /geoadventure_kv/{docId} {
//          allow read, write: if true;
//        }
//      }
//    }
//
// That's it — no other code changes are needed to go live.

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  documentId,
  getDocs,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCfHFKDVRwmNMx-Hd2zJPZsfCcQ15H7tL8",
  authDomain: "geo-adventure-981fe.firebaseapp.com",
  projectId: "geo-adventure-981fe",
  storageBucket: "geo-adventure-981fe.firebasestorage.app",
  messagingSenderId: "218144670070",
  appId: "1:218144670070:web:52ca452d94a89f0f41fa57",
  measurementId: "G-T2XZ2J1J3P",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Every key the app used to pass to window.storage (e.g. "player:geoad_jozel",
// "roster:humgeo:2:jozel") becomes one document's ID in this single
// collection, with the JSON payload stored in a "value" field — the same
// shape the app already expects back from a read.
const COLLECTION = "geoadventure_kv";

async function get(key) {
  const snap = await getDoc(doc(db, COLLECTION, key));
  if (!snap.exists()) return null;
  const data = snap.data();
  return { key, value: data.value, shared: true };
}

async function set(key, value) {
  await setDoc(doc(db, COLLECTION, key), { value, updatedAt: Date.now() });
  return { key, value, shared: true };
}

async function del(key) {
  await deleteDoc(doc(db, COLLECTION, key));
  return { key, deleted: true, shared: true };
}

async function list(prefix = "") {
  // Firestore's standard "prefix query" trick: documents whose id starts
  // with `prefix` all sort between `prefix` and `prefix + \uf8ff` (a very
  // high code point), so this range query returns exactly that set.
  const col = collection(db, COLLECTION);
  const q = prefix
    ? query(col, where(documentId(), ">=", prefix), where(documentId(), "<", prefix + "\uf8ff"), orderBy(documentId()))
    : query(col, orderBy(documentId()));
  const snaps = await getDocs(q);
  return { keys: snaps.docs.map((d) => d.id), prefix, shared: true };
}

// Install the same API the rest of the app already calls, so no other file
// needs to change: window.storage.get/set/delete/list(key, shared).
window.storage = {
  get: (key) => get(key),
  set: (key, value) => set(key, value),
  delete: (key) => del(key),
  list: (prefix) => list(prefix),
};
