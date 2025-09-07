import * as NavigationBar from "expo-navigation-bar";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import * as Updates from 'expo-updates';
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Button,
  Dimensions,
  Linking,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import CopyModal from "../../components/CopyModal";

const injectedJS = `
  (function() {
    let timer;
    document.addEventListener('touchstart', function(e) {
      let target = e.target.closest('a');
      if (!target) return;

      timer = setTimeout(function() {
        window.ReactNativeWebView.postMessage(target.href);
      }, 600); // نگه داشتن 600ms
    });

    document.addEventListener('touchend', function(e) {
      clearTimeout(timer);
    });
  })();
`;

export default function HomeScreen() {
  const [fullscreen, setFullscreen] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentLink, setCurrentLink] = useState("");

  const homeUrl = "https://next.fxman.xyz"; //MAKE SURE TO ALSO CHANGE ALLOWED DOMAINS
  const [url, setUrl] = useState(homeUrl);
  const webviewRef = useRef(null);

  const insets = useSafeAreaInsets();

  SplashScreen.preventAutoHideAsync();

  async function onFetchUpdateAsync() {
    try {
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
      }
    } catch (error) {
      // You can also add an alert() to see the error message in case of an error when fetching updates.
      alert(`Error fetching latest Expo update: ${error}`);
    }
  }

  const handleWebViewNavigation = (request, webviewRef, homeUrl) => {
    
    const allowedDomain = "fxman.xyz";
    const url = request.url;

    // لینک‌های داخلی سایت
    if (url.includes(allowedDomain)) {
      return true;
    }

    // بقیه لینک‌ها → مرورگر
    Linking.openURL(url);

    if (!url.includes("/dl/")) {
      webviewRef.current && webviewRef.current.injectJavaScript(`
        window.location.href = "${homeUrl}";
      `);
    }
    
    return false;
  }

  const handleWebViewLoad = () => {
    setInitialLoading(false);
    SplashScreen.hideAsync();
    if (initialLoading) {
      setInitialLoading(false); // فقط بار اول لودینگ بسته بشه
      SplashScreen.hideAsync();
    }
  };

  const enableFullscreen = async () => {
    if (Platform.OS === "android") {
      await NavigationBar.setVisibilityAsync("hidden");
    }
    StatusBar.setHidden(true, "fade");
    setFullscreen(true);
  };

  const disableFullscreen = async () => {
    if (Platform.OS === "android") {
      await NavigationBar.setVisibilityAsync("visible");
    }
    StatusBar.setHidden(false, "fade");
    setFullscreen(false);
  };

  const handleNavigationChange = (navState) => {
    setCanGoBack(navState.canGoBack);
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
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress
    );

    return () => subscription.remove();
  }, [canGoBack]);


  useEffect(() => {
    enableFullscreen();
    onFetchUpdateAsync();
  }, []);

  const handleMessage = (event) => {
    const link = event.nativeEvent.data;
    setCurrentLink(link);
    setModalVisible(true); // نمایش Modal
  };

  return (
    <SafeAreaView style={styles.container}>
      {hasError ? (
        <SafeAreaView
          style={[
            styles.container,
            { justifyContent: "center", alignItems: "center" },
          ]}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 16,
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            مشکلی در بارگذاری صفحه پیش آمد. {"\n"}لطفاً اتصال اینترنت را بررسی
            کنید.
          </Text>
          <Button
            title="تلاش مجدد"
            onPress={() => {
              setHasError(false);
              setLoading(true);
              webviewRef.current?.reload();
            }}
          />
        </SafeAreaView>
      ) : (
        <>
          {initialLoading  && (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color="#ffffff" />
              <Text style={{ color: "#fff", marginTop: 10 }}>
                در حال بارگذاری...
              </Text>
            </View>
          )}
          <CopyModal
            link={currentLink}
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
          />
          <WebView
            ref={webviewRef}
            source={{ uri: url }}
            style={[
              styles.webview,
              fullscreen
                ? {}
                : {
                    marginTop: insets.top,
                    marginBottom: insets.bottom,
                    height: Dimensions.get("window").height,
                  },
            ]}
            allowsFullscreenVideo={true}
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled={true}
            onMessage={handleMessage}
            onNavigationStateChange={handleNavigationChange}
            onLoadEnd={handleWebViewLoad} // ✅ اتمام لود
            injectedJavaScript={injectedJS}
            injectedJavaScriptBeforeContentLoaded={`
              if (!localStorage.getItem('isMobileApp')) {
                localStorage.setItem('isMobileApp', '1');
              }
              true;
            `}
            setSupportMultipleWindows={false}
            onShouldStartLoadWithRequest={(request) =>
                handleWebViewNavigation(request, webviewRef, homeUrl)
              }
            onError={() => setHasError(true)}
            onHttpError={() => setHasError(true)}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
});
