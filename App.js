import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,Platform
} from "react-native";
import { WebView } from "react-native-webview";
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Device } from 'expo-device';
import {
  getFirestore,
  collection,
  onSnapshot,query,where,getDocs,doc
} from "firebase/firestore";
import firebase from "./src/config/Firebase";

export default function App() {
  const db = getFirestore(firebase);
  const _usersCollection = collection(db, "Users");
  const [zoomEnabled, setZoomEnabled] = useState(true);
  const [token, setToken] = useState("");

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

  const onMessage = (event) => {
    console.log("hesre is data ");
    const data = JSON.parse(event.nativeEvent.data);
    console.log("here is data ", event.nativeEvent.data);
    if (data.type === "disableZoom") {
      setZoomEnabled(false);
      console.log("zoom disabled:");
    } else if (data.type === "enableZoom") {
      setZoomEnabled(true);
      console.log("zoom enabled:");
    } else if (data.type === "phoneNumber") {
      const phoneNumber = data.value;
      console.log("Received phone number:", phoneNumber);
      alert("Phone Number: " + phoneNumber);
    }
  };

  const injectScript = `
    document.addEventListener('DOMContentLoaded', function() {
      var inputFields = document.querySelectorAll('input[type="url"]');
      inputFields.forEach(function(input) {
        input.addEventListener('focus', function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'disableZoom' }));
        });
        input.addEventListener('blur', function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'enableZoom' }));
        });
      });

      var phoneInput = document.getElementById('phone');
      if (phoneInput) {
        phoneInput.addEventListener('input', function() {
          var phoneNumber = phoneInput.value;
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'phoneNumber', value: phoneNumber }));
        });
      }
    });
  `;

  const extractPhoneFromUrl = (url) => {
    // Split the URL by '?' to get the query string
    const queryString = url.split('?')[1];
    // Split the query string by '&' to get individual parameters
    const params = queryString.split('&');
    // Find the parameter with key 'phone'
    const phoneParam = params.find(param => param.startsWith('phone='));
    // If 'phone' parameter is found, extract its value
    if (phoneParam) {
      return decodeURIComponent(phoneParam.split('=')[1]);
    } else {
      return null;
    }
  };

  async function registerForPushNotificationsAsync(userDoc) {
    let token;
    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        alert("Failed to get push token for push notification!");
        return;
      }
      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log(token);
    }
    // else {
    //   alert('Must use physical device for Push Notifications');
    // }

    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }
    setToken(token);
    updateDoc(userDoc, { notificationToken: token })
    .then(() => {
      observer.next(); // Notify observer that the update was successful
    })
    .catch((error) => {
      observer.error(error); // Notify observer if there was an error
    });
    return token;
  }
  
  updateNotificationToken = async (phoneNumber) => {
    const usersCollection = _usersCollection;
    const usersQuery = query(usersCollection, where('phone', '==', phoneNumber));
  
    try {
      const querySnapshot = await getDocs(usersQuery);
      querySnapshot.forEach(async (doc) => {
        console.log("found");
        const userId = doc.id;
        const userDoc = doc.ref; // Use doc.ref to get a reference to the document
        console.log(JSON.stringify(doc.data()))
        if (doc.data().notificationToken === "") {
          await registerForPushNotificationsAsync(userDoc);
        }
      });
    } catch (error) {
      console.error('Error updating notification token:', error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <WebView
        style={styles.container_web}
        originWhitelist={["*"]}
        // source={{ uri: "https://melachat.web.app/authentication" }}
        source={{ uri: "https://e-health-3eda1.web.app/authentication" }}
        injectedJavaScript={injectScript}
        javaScriptEnabled={true}
        hideKeyboardAccessoryView={true}
        scalesPageToFit={zoomEnabled} // Disable zoom when zoomEnabled is false
        onMessage={onMessage}
        setBuiltInZoomControls={false}
        onNavigationStateChange={async (state)=>{
          const back = state.canGoBack;
          const currentUrl = state.url;
          const phone = extractPhoneFromUrl(currentUrl);
          if (phone) {
             updateNotificationToken(phone);
          }
          console.log(phone)
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container_web: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    height: 300,
    backgroundColor: "white",
  },
  button: {
    padding: 12,
    fontSize: 20,
    color: "red",
  },
  textColor: {
    color: "red",
  },
});
