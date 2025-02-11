import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  StyleSheet,
} from "react-native";
import { MessageCard } from "@/components/MessageCard";
import { fetch } from "expo/fetch";

type Message = {
  role: "assistant" | "user" | "system";
  content: string;
};

const ChatAi = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hallo! I am your health assistant. How can I help you with health, fitness, or nutrition today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (input.trim() === "") return;

    const newMessage: Message = { role: "user", content: input.trim() };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://192.168.0.129:11434/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "deepseek-r1:1.5b",
            messages: [
              {
                role: "system",
                content:
                  "You are a health assistant. Only respond to questions related to health, fitness, nutrition, and well-being. If the user asks about unrelated topics, politely decline to answer and remind them that you are a health assistant.",
              },
              {
                role: "system",
                content:
                  "User name Rezi, born September 8 1999, male, height 175cm, weight 61kg, and regularly exercises 4 days a week",
              },
              newMessage,
            ],
            stream: true,
            stop: ["```"],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No reader available");
      }

      let assistantMessage = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content;
              if (content) {
                assistantMessage += content;
                setMessages((prevMessages) => {
                  const lastMessage = prevMessages[prevMessages.length - 1];
                  if (lastMessage.role === "assistant") {
                    return [
                      ...prevMessages.slice(0, -1),
                      { ...lastMessage, content: assistantMessage },
                    ];
                  } else {
                    return [
                      ...prevMessages,
                      { role: "assistant", content: assistantMessage },
                    ];
                  }
                });
              }
            } catch (e) {
              console.error("Error parsing chunk:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.messagesContainer}>
        {messages.map((message, index) => (
          <MessageCard
            key={index}
            role={message.role}
            message={message.content}
          />
        ))}
      </ScrollView>
      <View style={styles.thinkingContainer}>
        {loading && <Text style={styles.thinkingText}>Thinking...</Text>}
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type your message..."
          editable={!loading}
        />
        <Button title="Send" onPress={handleSubmit} disabled={loading} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  messagesContainer: {
    flex: 1,
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 4,
    padding: 8,
    marginRight: 8,
  },
  thinkingContainer: {
    alignItems: "center",
    marginVertical: 8,
  },
  thinkingText: {
    fontSize: 16,
    color: "#666",
  },
});

export default ChatAi;
