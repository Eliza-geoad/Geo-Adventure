# GeoAdventure — deployment guide

This is now a real, standalone web app (built with Vite + React) instead of
a Claude artifact file. It uses Firebase Firestore as a free, shared cloud
database, so your teacher dashboard and every student's account — on any
phone, tablet, or laptop — see the exact same live data.

You do **not** need to know how to code to deploy this. Follow the steps in
order.

## Step 1 — Create your free Firebase project (~5 minutes)

1. Go to https://console.firebase.google.com and sign in with a Google
   account.
2. Click **Add project**, give it any name (e.g. "geoadventure"), and finish
   the wizard (you can turn off Google Analytics — not needed).
3. In the left sidebar, click **Build > Firestore Database**, then
   **Create database**. Choose any region close to you, and select
   **Start in test mode** (simplest for a class project).
4. Click the **gear icon (⚙) > Project settings**, scroll down to
   **Your apps**, and click the **</>** (web) icon to register a new web
   app. Give it any nickname and click **Register app**.
5. Firebase will show you a code block containing a `firebaseConfig` object
   with values like `apiKey`, `authDomain`, `projectId`, etc. Keep this tab
   open — you'll copy these into the project in Step 2.
6. Back in Firestore, go to the **Rules** tab and replace the contents with:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /geoadventure_kv/{docId} {
         allow read, write: if true;
       }
     }
   }
   ```

   Click **Publish**. (This keeps the database open to anyone who has your
   app's web address — reasonable for a classroom demo, not for a
   production app with sensitive data.)

## Step 2 — Add your Firebase config to the project

Open `src/firebaseStorage.js` in this project and replace the placeholder
values in the `firebaseConfig` object near the top with the real values
Firebase showed you in Step 1.5.

## Step 3 — Put this project on GitHub

1. Go to https://github.com and create a free account if you don't have one.
2. Create a **new repository** (e.g. "geoadventure"), keep it public or
   private, and don't add a README (you already have one).
3. Upload this entire project folder to that repository. The easiest way
   with no command line: on the repository page, click
   **Add file > Upload files**, then drag in every file and folder from
   this project (keep the folder structure — `src/` should stay a folder).

## Step 4 — Deploy for free on Vercel

1. Go to https://vercel.com and sign up (you can sign up directly with your
   GitHub account — easiest option).
2. Click **Add New... > Project**, then find and import the GitHub
   repository you just created.
3. Vercel auto-detects this as a Vite project — leave the default settings
   and click **Deploy**.
4. After a minute, Vercel gives you a live URL like
   `https://geoadventure-yourname.vercel.app`. That's the link — share it
   with your teacher and every student. Anyone who opens it, on any device,
   is using the same live app and the same shared data.

## Updating later

Any time you want to change the app (edit questions, tweak colors, etc.),
edit the files in this project, re-upload the changed files to GitHub, and
Vercel automatically redeploys the new version within a minute or two.

## Costs

Firebase's free "Spark" plan and Vercel's free "Hobby" plan both comfortably
cover a classroom-scale project like this (tens of students, thousands of
reads/writes a day). Nothing here requires a credit card.
