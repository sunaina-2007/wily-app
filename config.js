import * as firebase from 'firebase';
require('@firebase/firestore')

var firebaseConfig = {
    apiKey: "AIzaSyDuAsIZU4wbOyD44sYn71phPULyvAok0bQ",
    authDomain: "wily-app-b3e7a.firebaseapp.com",
    projectId: "wily-app-b3e7a",
    storageBucket: "wily-app-b3e7a.appspot.com",
    messagingSenderId: "38810728465",
    appId: "1:38810728465:web:450a300a9b7cad4ee9d9b0"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  export default firebase.firestore();