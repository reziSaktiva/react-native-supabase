import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import { Todo } from "@/utils/interfaces";
import SwipeableRow from "@/components/swipeableRow";
import { Ionicons } from "@expo/vector-icons";

const Page = () => {
  const [todo, setTodo] = useState("");
  const [loading, setLoading] = useState(false);
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .eq("user_id", user.id)
      .order("inserted_at", { ascending: false });

    if (error) {
      console.log("error", error);
      return;
    }

    setTodos(data);
  };

  const addTodo = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.log("User not found");
        return;
      }

      const newTodo = {
        task: todo,
        user_id: user?.id,
      };

      const { data, error } = await supabase
        .from("todos")
        .insert(newTodo)
        .select()
        .single();

      if (error) {
        console.log("error", error);
        return;
      }

      setTodos([data, ...todos]);
      setTodo("");
    } catch (error) {
      console.log("error", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTodo = async (id: number) => {
    try {
      const { error } = await supabase.from("todos").delete().eq("id", id);

      if (error) {
        console.log("error", error);
        return;
      }

      setTodos(todos.filter((todo) => todo.id !== id));
    } catch (error) {
      console.log("error", error);
    }
  };

  const updateTodo = async (id: number, is_complete: boolean) => {
    try {
      const { error } = await supabase
        .from("todos")
        .update({ is_complete })
        .eq("id", id);

      if (error) {
        console.log("error", error);
        return;
      }

      setTodos(
        todos.map((todo) => (todo.id === id ? { ...todo, is_complete } : todo))
      );
    } catch (error) {
      console.log("error", error);
    }
  };

  const renderTodo = ({ item }: { item: Todo }) => (
    <SwipeableRow
      todo={item}
      onToggle={() => updateTodo(item.id, !item.is_complete)}
      onDelete={() => deleteTodo(item.id)}
    >
      <View style={styles.todoItem}>
        <Text style={styles.todoText}>{item.task}</Text>
        {item.is_complete && (
          <Ionicons
            name="checkmark-done-circle-outline"
            size={17}
            color="#2b825b"
          />
        )}
      </View>
    </SwipeableRow>
  );

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Todo"
          value={todo}
          onChangeText={setTodo}
          placeholderTextColor="#999"
          style={styles.textInput}
        />
        <Button
          title="Add Todo"
          color="#2b825b"
          disabled={loading || todo === ""}
          onPress={addTodo}
        />
      </View>
      <FlatList
        data={todos}
        renderItem={renderTodo}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#151515",
  },
  inputContainer: {
    flexDirection: "row",
    marginBottom: 20,
    padding: 20,
  },
  textInput: {
    flex: 1,
    backgroundColor: "#505050",
    padding: 8,
    borderWidth: 1,
    borderColor: "#2b825b",
    color: "#fff",
    borderRadius: 4,
    marginRight: 10,
  },
  list: {
    flex: 1,
  },
  todoItem: {
    backgroundColor: "#363636",
    padding: 15,
    marginBottom: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: "#2b825b",
    borderBottomColor: "#2b825b",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  todoText: {
    color: "#fff",
    flex: 1,
  },
});

export default Page;
