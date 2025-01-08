import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  FlatList,
} from "react-native";
import React, { useState, useEffect } from "react";
import SwipeableRow from "@/components/swipeableRow";
import { Ionicons } from "@expo/vector-icons";
import { useSystem } from "@/powersync/drizzle/PowerSync";
import { uuid } from "@/powersync/uuid";
import { Todo, todos as todoSchema } from "@/powersync/drizzle/AppSchema";
import { eq } from "drizzle-orm";

const Page = () => {
  const [task, setTask] = useState("");
  const [loading, setLoading] = useState(false);
  const [todos, setTodos] = useState<Todo[]>([]);
  const { supabaseConnector, db } = useSystem();

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    const result = await db?.select().from(todoSchema);
    setTodos(result || []);
  };

  const addTodo = async () => {
    const { userID } = await supabaseConnector.fetchCredentials();
    const todoId = uuid();

    await db
      ?.insert(todoSchema)
      .values({ id: todoId, task, user_id: userID, is_complete: 0 })
      .execute();

    setTask("");
    loadTodos();
  };

  const updateTodo = async (todo: Todo) => {
    await db
      ?.update(todoSchema)
      .set({ is_complete: todo.is_complete === 1 ? 0 : 1 })
      .where(eq(todoSchema.id, todo.id))
      .execute();
    // await db
    //   ?.updateTable(TODOS_TABLE)
    //   .where("id", "=", todo.id)
    //   .set()
    //   .execute();
    loadTodos();
  };

  const deleteTodo = async (todo: Todo) => {
    await db?.delete(todoSchema).where(eq(todoSchema.id, todo.id)).execute();
    loadTodos();
  };

  const renderRow = ({ item }: { item: Todo }) => (
    <SwipeableRow
      todo={item}
      onToggle={() => updateTodo(item)}
      onDelete={() => deleteTodo(item)}
    >
      <View style={styles.todoItem}>
        <Text style={styles.todoText}>{item.task}</Text>
        {item.is_complete === 1 && (
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
          value={task}
          onChangeText={setTask}
          placeholderTextColor="#999"
          style={styles.textInput}
        />
        <Button
          title="Add Todo"
          color="#2b825b"
          disabled={loading || task === ""}
          onPress={addTodo}
        />
      </View>
      <FlatList
        data={todos}
        renderItem={renderRow}
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
