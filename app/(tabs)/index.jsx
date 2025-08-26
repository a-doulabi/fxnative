import * as Linking from 'expo-linking';
import * as NavigationBar from "expo-navigation-bar";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import { BackHandler, Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from "react-native-webview";

export default function HomeScreen() {

  const [fullscreen, setFullscreen] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const webviewRef = useRef(null);

  const insets = useSafeAreaInsets();

  useEffect(() => {
    const handleUrl = (event) => {
      const url = event.url;
      console.log("برگشت از درگاه:", url);
      // اینجا میتونید URL رو به وب‌ویو بدهید یا نمایش پیام بدهید
      if (url.startsWith("zipay://premium/join/")) {
        webviewRef.current?.injectJavaScript(`
          window.location.href = "${url.replace('zipay://', 'https://fxman.xyz/')}";
        `);
      }
    };

    const subscription = Linking.addEventListener('url', handleUrl);

    // اگر اپ در زمان باز شدن از طریق URL اجرا شد
    Linking.getInitialURL().then((url) => {
      if (url) handleUrl({ url });
    });

    return () => subscription.remove();
  }, []);

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
    <View style={styles.container}>
      <WebView
        ref={webviewRef}
        source={{ uri: "https://fxman.xyz" }}
        style={[styles.webview, fullscreen ? {} : { marginTop: insets.top, marginBottom: insets.bottom }]} // 🔑 مارجین فقط در حالت غیر فول‌اسکرین
        allowsFullscreenVideo={true}
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled={true}
        onNavigationStateChange={handleNavigationChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
});
