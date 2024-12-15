import React, { useCallback, useState, useEffect, useRef } from 'react';
import { Portal, Dialog, TextInput, Button, Text } from 'react-native-paper';
import type Todo from '../types/todo';

interface EditTodoDialogProps {
  visible: boolean;
  todo: Todo | null;
  onDismiss: () => void;
  onConfirm: (title: string) => void;
}

export default function EditTodoDialog({
  visible,
  todo,
  onDismiss,
  onConfirm,
}: EditTodoDialogProps) {
  const [error, setError] = useState('');
  const titleRef = useRef('');

  useEffect(() => {
    if (todo) {
      titleRef.current = todo.title;
      setError('');
    }
  }, [todo]);

  const handleConfirm = useCallback(() => {
    const trimmedTitle = titleRef.current.trim();
    if (!trimmedTitle) {
      setError('Todo title cannot be empty');
      return;
    }
    onConfirm(trimmedTitle);
  }, [onConfirm]);

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>Edit Todo</Dialog.Title>
        <Dialog.Content>
          <TextInput
            label="Todo Title"
            defaultValue={todo?.title}
            onChangeText={(text) => {
              titleRef.current = text;
              setError('');
            }}
            error={!!error}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleConfirm}
          />
          {error ? (
            <Text style={{ color: 'red', fontSize: 12, marginTop: 4 }}>
              {error}
            </Text>
          ) : null}
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Cancel</Button>
          <Button onPress={handleConfirm}>Save</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
