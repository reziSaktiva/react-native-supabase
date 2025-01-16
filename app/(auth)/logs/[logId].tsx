import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, FlatList, StyleSheet, Pressable } from "react-native";
import SwipeableRow from "@/components/swipeableRow";
import { Ionicons } from "@expo/vector-icons";
import { useSystem } from "@/powersync/drizzle/PowerSync";
import { Note, notes as noteSchema } from "@/powersync/drizzle/AppSchema";
import { uuid } from "@/powersync/uuid";
import { eq } from "drizzle-orm";
import { useLocalSearchParams } from "expo-router";


const Notes = () => {
    const { logId } = useLocalSearchParams<{
        logId: string;
    }>();
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [notes, setNotes] = useState<Note[]>([]);
    const { db, powersync } = useSystem();

    useEffect(() => {
        loadNotes();
    }, []);

    const loadNotes = async () => {
        const result = await db?.select().from(noteSchema).where(eq(noteSchema.log_id, logId));

        setNotes(result || []);
    };

    const addNote = async () => {
        const noteId = uuid();

        await db
            ?.insert(noteSchema)
            .values({ id: noteId, content, log_id: logId })
            .execute();

        setContent("");
        loadNotes();
    };

    const updateNote = async () => {
        // await db
        //   ?.update()
        //   .set({ is_complete: note.is_complete === 1 ? 0 : 1 })
        //   .where(eq(noteSchema.id, note.id))
        //   .execute();

        // loadNotes();
    };

    const deleteNote = async (note: Note) => {
        await db?.delete(noteSchema).where(eq(noteSchema.id, note.id)).execute();
        loadNotes();
    };

    const renderRow = ({ item }: { item: Note }) => (
        <View style={styles.todoItem}>
            <Text style={styles.todoText}>{item.content}</Text>
            <Pressable onPress={() => deleteNote(item)}>
                <Ionicons
                    name="trash"
                    size={17}
                    color="red"
                />
            </Pressable>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                <TextInput
                    placeholder="Content of Note"
                    value={content}
                    onChangeText={setContent}
                    placeholderTextColor="#999"
                    style={styles.textInput}
                />
                <Button
                    title="Add Note"
                    color="#2b825b"
                    disabled={loading || content === ""}
                    onPress={addNote}
                />
            </View>
            <FlatList
                data={notes}
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

export default Notes;
