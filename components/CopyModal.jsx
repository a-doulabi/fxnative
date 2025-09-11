import * as Clipboard from "expo-clipboard";
import { Modal, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";

export default function CopyModal({ link, visible, onClose }) {
  const copyLink = () => {
    Clipboard.setStringAsync(link);
    onClose(); // Modal بسته میشه
  };

  if(!link) return null;

  if(!link.includes('/dl/')) return null;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center"
        }}>
          <TouchableWithoutFeedback>
            <View style={{
              backgroundColor: "white",
              padding: 20,
              borderRadius: 10,
              width: "80%", // عرض مودال ثابت، ارتفاع بر اساس محتوا
              alignItems: "center"
            }}>
              <Text style={{ marginBottom: 20, textAlign: "center" }}>{link}</Text>
              <View style={{ flexDirection: "row", justifyContent: "space-around", width: "100%" }}>
                <TouchableOpacity 
                  onPress={copyLink} 
                  style={{ backgroundColor: "#000", paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8 }}
                >
                  <Text style={{ color:"white" }}>کپی کردن لینک</Text>
                </TouchableOpacity>
                {/* <TouchableOpacity onPress={onClose} style={{ paddingVertical: 12, paddingHorizontal: 16 }}>
                  <Text style={{ color:"red" }}>بستن</Text>
                </TouchableOpacity> */}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
