import * as NavigationBar from "expo-navigation-bar";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import { BackHandler, Dimensions, Linking, Platform, SafeAreaView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from "react-native-webview";

export default function HomeScreen() {

  const [fullscreen, setFullscreen] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const homeUrl = "https://fxman.xyz";
  const [url, setUrl] = useState(homeUrl);
  const webviewRef = useRef(null);

  const insets = useSafeAreaInsets();

  const enableFullscreen = async () => {
    if (Platform.OS === "android") {
      await NavigationBar.setVisibilityAsync("hidden"); // مخفی کردن نوار پایین
      // await NavigationBar.setBackgroundColorAsync("black"); // رنگ پس‌زمینه
    }
    StatusBar.setHidden(true, "fade"); // مخفی کردن نوار بالا

    setFullscreen(true)
  };

  const disableFullscreen = async () => {
    if (Platform.OS === "android") {
      await NavigationBar.setVisibilityAsync("visible");
      // await NavigationBar.setBackgroundColorAsync("white");
    }
    StatusBar.setHidden(false, "fade");
    setFullscreen(false)
  };

  const handleNavigationChange = (navState) => {
    setCanGoBack(navState.canGoBack);
    // فقط وقتی آدرس شامل /watch/ هست Fullscreen فعال میشه
    if (navState.url.includes("/watch/")) {
      enableFullscreen();
    } else {
      disableFullscreen();
    }
  };

  useEffect(() => {
  const onBackPress = () => {
    if (webviewRef.current && canGoBack) {
      webviewRef.current.goBack();
      return true; // جلوگیری از بسته شدن اپ
    }
    return false; // اجازه میده اپ بسته بشه
  };

  const subscription = BackHandler.addEventListener(
    "hardwareBackPress",
    onBackPress
  );

  return () => subscription.remove(); // ✅ این روش در نسخه‌های جدید درست است
}, [canGoBack]);


  // اطمینان از حالت اولیه (اگر صفحه /watch/ باز شد)
  useEffect(() => {
    enableFullscreen();
  }, []);


  return (
    <SafeAreaView  style={styles.container}>

        <WebView
        ref={webviewRef}
        source={{ uri: url }}
        style={[styles.webview, fullscreen ? {} : { marginTop: insets.top, marginBottom: insets.bottom, height: Dimensions.get("window").height }]} // 🔑 مارجین فقط در حالت غیر فول‌اسکرین
        allowsFullscreenVideo={true}
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled={true}
        onNavigationStateChange={handleNavigationChange}
        setSupportMultipleWindows={false} // 👈 خیلی مهم
        onShouldStartLoadWithRequest={(request) => {
          const allowedDomain = "fxman.xyz";

          if (request.url.includes(allowedDomain)) {
            return true; // لینک داخلی
          }

          // لینک خارجی:
          Linking.openURL(request.url); // باز کردن تو مرورگر
          webviewRef.current?.injectJavaScript(`
            window.location.href = "${homeUrl}";
          `);// برگشت به صفحه اصلی
          return false;
        }}
      />
      
    </SafeAreaView >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
});
