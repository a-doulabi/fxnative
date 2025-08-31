import * as NavigationBar from "expo-navigation-bar";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import { BackHandler, Button, Dimensions, Linking, Platform, SafeAreaView, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from "react-native-webview";

export default function HomeScreen() {

  const [fullscreen, setFullscreen] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [hasError, setHasError] = useState(false);
  const homeUrl = "https://apk.fxbob.com";
  const [url, setUrl] = useState(homeUrl);
  const webviewRef = useRef(null);

  const insets = useSafeAreaInsets();

  SplashScreen.preventAutoHideAsync();

  const handleWebViewLoad = () => {
    SplashScreen.hideAsync(); // وقتی وب‌ویو آماده شد اسپلش بسته میشه
  };

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
        
        {hasError ? <SafeAreaView style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
            <Text style={{ color: "#fff", fontSize: 16, textAlign: "center", marginBottom: 20 }}>
              مشکلی در بارگذاری صفحه پیش آمد. {"\n"}لطفاً اتصال اینترنت را بررسی کنید.
            </Text>
            <Button title="تلاش مجدد" onPress={() => {
              setHasError(false);
              webviewRef.current?.reload(); // تلاش دوباره برای بارگذاری
            }} />
          </SafeAreaView> : 
        <WebView
        ref={webviewRef}
        source={{ uri: url }}
        style={[styles.webview, fullscreen ? {} : { marginTop: insets.top, marginBottom: insets.bottom, height: Dimensions.get("window").height }]} // 🔑 مارجین فقط در حالت غیر فول‌اسکرین
        allowsFullscreenVideo={true}
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled={true}
        onLoadEnd={handleWebViewLoad}
        injectedJavaScriptBeforeContentLoaded={`
          if (!localStorage.getItem('isMobileApp')) {
            localStorage.setItem('isMobileApp', '1');
          }
          true;
        `}
        onNavigationStateChange={handleNavigationChange}
        setSupportMultipleWindows={false} // 👈 خیلی مهم
        onShouldStartLoadWithRequest={(request) => {
          const allowedDomain = "fxbob.com";

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
        onError={() => setHasError(true)}
        onHttpError={() => setHasError(true)}
      />}
        
      
    </SafeAreaView >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
});
