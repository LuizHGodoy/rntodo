import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, FlatList, StyleSheet, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { Text, Checkbox, FAB, Portal, Dialog, TextInput, Button, useTheme } from 'react-native-paper';
import useTodoStore from '../store/todoStore';
import { useViewStore } from '../store/viewStore';
import CustomHeader from '../components/CustomHeader';
import KanbanView from '../components/KanbanView';
import DeleteConfirmationDialog from '../components/DeleteConfirmationDialog';
import EditTodoDialog from '../components/EditTodoDialog';
import type { Todo } from '../types/todo';

export default function TodoListScreen() {
  const theme = useTheme();
  const { todos, isLoading, error, fetchTodos, toggleTodo, removeTodo, addTodo, editTodo } = useTodoStore();
  const { viewMode } = useViewStore();
  const [visible, setVisible] = useState(false);
  const [inputError, setInputError] = useState('');
  const todoText = useRef('');
  const [todoToDelete, setTodoToDelete] = useState<Todo | null>(null);
  const [todoToEdit, setTodoToEdit] = useState<Todo | null>(null);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const showDialog = useCallback(() => {
    setVisible(true);
    setInputError('');
    todoText.current = '';
  }, []);

  const hideDialog = useCallback(() => {
    setVisible(false);
    setInputError('');
    todoText.current = '';
  }, []);

  const handleAddTodo = useCallback(async () => {
    const title = todoText.current.trim();
    if (!title) {
      setInputError('Todo title cannot be empty');
      return;
    }
    
    try {
      await addTodo(title);
      hideDialog();
    } catch (error) {
      setInputError((error as Error).message);
    }
  }, [addTodo, hideDialog]);

  const handleDeleteTodo = useCallback((todo: Todo) => {
    setTodoToDelete(todo);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (todoToDelete) {
      removeTodo(todoToDelete.id);
      setTodoToDelete(null);
    }
  }, [todoToDelete, removeTodo]);

  const handleCancelDelete = useCallback(() => {
    setTodoToDelete(null);
  }, []);

  const handleEditTodo = useCallback((todo: Todo) => {
    setTodoToEdit(todo);
  }, []);

  const handleConfirmEdit = useCallback(async (newTitle: string) => {
    if (todoToEdit) {
      await editTodo(todoToEdit.id, newTitle);
      setTodoToEdit(null);
    }
  }, [todoToEdit, editTodo]);

  const handleCancelEdit = useCallback(() => {
    setTodoToEdit(null);
  }, []);

  const renderTodoItem = useCallback(({ item }: { item: Todo }) => (
    <Pressable onPress={() => handleEditTodo(item)}>
      <View style={styles.todoItem}>
        <Checkbox
          status={item.completed ? 'checked' : 'unchecked'}
          onPress={() => toggleTodo(item.id)}
        />
        <Text 
          style={[
            styles.todoText,
            { 
              textDecorationLine: item.completed ? 'line-through' : 'none',
              color: theme.colors.onBackground
            }
          ]}
        >
          {item.title}
        </Text>
        <Button 
          icon="delete" 
          onPress={() => handleDeleteTodo(item)}
          textColor={theme.colors.error}
        >
          Remove
        </Button>
      </View>
    </Pressable>
  ), [theme.colors.onBackground, theme.colors.error, toggleTodo, handleDeleteTodo, handleEditTodo]);

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <Text style={{ color: theme.colors.error }}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <CustomHeader />
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {viewMode === 'list' ? (
          <FlatList
            data={todos}
            renderItem={renderTodoItem}
            keyExtractor={(item) => item.id}
            refreshing={isLoading}
            onRefresh={fetchTodos}
            ListEmptyComponent={
              <Text style={[styles.emptyText, { color: theme.colors.onBackground }]}>
                No todos yet. Add a new todo!
              </Text>
            }
          />
        ) : (
          <KanbanView
            todos={todos}
            onToggleTodo={toggleTodo}
            onRemoveTodo={removeTodo}
            onEditTodo={editTodo}
          />
        )}

        <FAB
          icon="plus"
          style={[
            styles.fab,
            { 
              backgroundColor: theme.colors.elevation.level3,
            }
          ]}
          onPress={showDialog}
          color={theme.colors.onBackground}
        />

        <Portal>
          <Dialog visible={visible} onDismiss={hideDialog}>
            <Dialog.Title>Add New Todo</Dialog.Title>
            <Dialog.Content>
              <TextInput
                label="Todo Title"
                onChangeText={(text) => {
                  todoText.current = text;
                  setInputError('');
                }}
                error={!!inputError}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleAddTodo}
              />
              {inputError ? (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  {inputError}
                </Text>
              ) : null}
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={hideDialog}>Cancel</Button>
              <Button onPress={handleAddTodo}>Add</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>

        <DeleteConfirmationDialog
          visible={!!todoToDelete}
          onDismiss={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          title="Delete Todo"
          content={todoToDelete ? `Are you sure you want to delete "${todoToDelete.title}"?` : ''}
        />

        <EditTodoDialog
          visible={!!todoToEdit}
          todo={todoToEdit}
          onDismiss={handleCancelEdit}
          onConfirm={handleConfirmEdit}
        />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  todoText: {
    flex: 1,
    marginHorizontal: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
});
