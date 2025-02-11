import React from "react";
import { View, Text, StyleSheet } from "react-native";

type MessageCardProps = {
  role: "assistant" | "user" | "system";
  message: string;
};

export const MessageCard = (props: MessageCardProps) => {
  return (
    <View
      style={[
        styles.messageCard,
        props.role === "user" ? styles.userMessage : styles.assistantMessage,
      ]}
    >
      <Text
        style={props.role === "user" ? styles.userText : styles.assistantText}
      >
        {props.message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  messageCard: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    maxWidth: "80%",
    alignSelf: "flex-start",
    marginVertical: 4,
  },
  userMessage: {
    backgroundColor: "#1E90FF",
    alignSelf: "flex-end",
  },
  assistantMessage: {
    backgroundColor: "#E0E0E0",
  },
  userText: {
    color: "#FFFFFF",
  },
  assistantText: {
    color: "#000000",
  },
});
