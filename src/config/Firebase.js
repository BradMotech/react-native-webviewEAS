import { initializeApp } from "firebase/app";

// Optionally import the services that you want to use
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    projectId: 'e-health-3eda1',
    appId: '1:544211878229:web:7851d2d4dbc7e6374eafdc',
    databaseURL: 'https://e-health-3eda1-default-rtdb.firebaseio.com',
    storageBucket: 'e-health-3eda1.appspot.com',
    locationId: 'us-central',
    apiKey: 'AIzaSyDtxZple_3xBBV5UG5nFKtnAKkOE1QlAis',
    authDomain: 'e-health-3eda1.firebaseapp.com',
    messagingSenderId: '544211878229',
    measurementId: 'G-WK94J3CD3K',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// const auth = getAuth(app);
export default app;