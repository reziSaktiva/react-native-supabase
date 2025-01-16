import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, FlatList, StyleSheet, Pressable } from "react-native";
import { useSystem } from "@/powersync/drizzle/PowerSync";
import { Log, logs as logSchema } from "@/powersync/drizzle/AppSchema";
import { uuid } from "@/powersync/uuid";
import { eq } from "drizzle-orm";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";


const Page = () => {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [loading, setLoading] = useState(false);
    const [logs, setLogs] = useState<Log[]>([]);
    const { supabaseConnector, db } = useSystem();

    useEffect(() => {
        loadTodos();
    }, []);

    const loadTodos = async () => {
        const result = await db?.select().from(logSchema);

        setLogs(result || []);
    };

    const addTodo = async () => {
        const { userID } = await supabaseConnector.fetchCredentials();
        const logId = uuid();

        await db
            ?.insert(logSchema)
            .values({ id: logId, title, user_id: userID })
            .execute();

        setTitle("");
        loadTodos();
    };

    const updateTodo = async () => {
        // await db
        //   ?.update()
        //   .set({ is_complete: todo.is_complete === 1 ? 0 : 1 })
        //   .where(eq(todoSchema.id, todo.id))
        //   .execute();

        // loadTodos();
    };

    const deleteTodo = async (log: Log) => {
        await db?.delete(logSchema).where(eq(logSchema.id, log.id)).execute();
        loadTodos();
    };

    const renderRow = ({ item }: { item: Log }) => (
        <Pressable onPress={() => router.push(`/logs/${item.id}`)}>
            <View style={styles.todoItem}>
                <Text style={styles.todoText}>{item.title}</Text>
                <Pressable onPress={() => deleteTodo(item)}>
                    <Ionicons
                        name="trash"
                        size={17}
                        color="red"
                    />
                </Pressable>
            </View>
        </Pressable>
    );

    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                <TextInput
                    placeholder="Title of Log"
                    value={title}
                    onChangeText={setTitle}
                    placeholderTextColor="#999"
                    style={styles.textInput}
                />
                <Button
                    title="Add Log"
                    color="#2b825b"
                    disabled={loading || title === ""}
                    onPress={addTodo}
                />
            </View>
            <FlatList
                data={logs}
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
