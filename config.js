import * as firebase from 'firebase';
require('@firebase/firestore')

  // Your web app's Firebase configuration
  var firebaseConfig = {
    apiKey: "AIzaSyCyrxBCq2NinGSQ9OiuA5uyVePxjZu1mRA",
    authDomain: "wily-app-b2a6c.firebaseapp.com",
    projectId: "wily-app-b2a6c",
    storageBucket: "wily-app-b2a6c.appspot.com",
    messagingSenderId: "204644619490",
    appId: "1:204644619490:web:e8c0f7028c7b492fc3fabb"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  export default firebase.firestore();