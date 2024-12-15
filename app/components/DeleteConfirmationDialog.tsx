import React from 'react';
import { Portal, Dialog, Button, Text } from 'react-native-paper';

interface DeleteConfirmationDialogProps {
  visible: boolean;
  onDismiss: () => void;
  onConfirm: () => void;
  title?: string;
  content?: string;
}

export default function DeleteConfirmationDialog({
  visible,
  onDismiss,
  onConfirm,
  title = 'Delete Todo',
  content = 'Are you sure you want to delete this todo?',
}: DeleteConfirmationDialogProps) {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">{content}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Cancel</Button>
          <Button mode="contained" onPress={onConfirm} textColor="white">
            Delete
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
