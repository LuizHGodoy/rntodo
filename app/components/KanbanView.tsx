import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import type Todo from '../types/todo';
import DraggableCard from './DraggableCard';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import EditTodoDialog from './EditTodoDialog';

const AnimatedView = Animated.createAnimatedComponent(View);

interface KanbanViewProps {
  todos: Todo[];
  onToggleTodo: (id: string) => void;
  onRemoveTodo: (id: string) => void;
  onEditTodo: (id: string, title: string) => void;
}

interface ColumnProps {
  title: string;
  todos: Todo[];
  onToggleTodo: (id: string) => void;
  onRemoveTodo: (id: string) => void;
  onEditTodo: (id: string, title: string) => void;
  isTargetColumn: boolean;
  onDragUpdate: (x: number) => void;
}

function Column({ title, todos, onToggleTodo, onRemoveTodo, onEditTodo, isTargetColumn, onDragUpdate }: ColumnProps) {
  const theme = useTheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const [todoToEdit, setTodoToEdit] = React.useState<Todo | null>(null);

  React.useEffect(() => {
    if (isTargetColumn) {
      scale.value = withSpring(1.02);
      opacity.value = withSpring(0.9);
    } else {
      scale.value = withSpring(1);
      opacity.value = withSpring(1);
    }
  }, [isTargetColumn, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handleEditTodo = React.useCallback((todo: Todo) => {
    setTodoToEdit(todo);
  }, []);

  const handleConfirmEdit = React.useCallback((newTitle: string) => {
    if (todoToEdit) {
      onEditTodo(todoToEdit.id, newTitle);
      setTodoToEdit(null);
    }
  }, [todoToEdit, onEditTodo]);

  const handleCancelEdit = React.useCallback(() => {
    setTodoToEdit(null);
  }, []);
  
  return (
    <AnimatedView style={[styles.column, animatedStyle]}>
      <Text variant="titleMedium" style={[styles.columnTitle, { color: theme.colors.primary }]}>
        {title}
      </Text>
      <View 
        style={[
          styles.list, 
          { 
            backgroundColor: theme.colors.elevation.level1,
            borderColor: isTargetColumn ? theme.colors.primary : 'transparent',
            borderWidth: 2,
          }
        ]}
      >
        <ScrollView>
          {todos.map((todo) => (
            <DraggableCard
              key={todo.id}
              todo={todo}
              onDragEnd={(completed) => onToggleTodo(todo.id)}
              onToggle={() => onToggleTodo(todo.id)}
              onRemove={() => onRemoveTodo(todo.id)}
              onEdit={() => handleEditTodo(todo)}
              onDragUpdate={onDragUpdate}
            />
          ))}
          {todos.length === 0 && (
            <Text style={[styles.emptyText, { color: theme.colors.onSurfaceDisabled }]}>
              No {title.toLowerCase()} todos
            </Text>
          )}
        </ScrollView>
      </View>

      <EditTodoDialog
        visible={!!todoToEdit}
        todo={todoToEdit}
        onDismiss={handleCancelEdit}
        onConfirm={handleConfirmEdit}
      />
    </AnimatedView>
  );
}

export default function KanbanView({ todos, onToggleTodo, onRemoveTodo, onEditTodo }: KanbanViewProps) {
  const pendingTodos = todos.filter((todo) => !todo.completed);
  const completedTodos = todos.filter((todo) => todo.completed);
  const [draggedToColumn, setDraggedToColumn] = React.useState<'pending' | 'completed' | null>(null);

  const handleDragUpdate = React.useCallback((translationX: number) => {
    if (translationX > 100) {
      setDraggedToColumn('completed');
    } else if (translationX < -100) {
      setDraggedToColumn('pending');
    } else {
      setDraggedToColumn(null);
    }
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.wrapper}>
        <ScrollView horizontal contentContainerStyle={styles.scrollContent}>
          <Column
            title="Pending"
            todos={pendingTodos}
            onToggleTodo={onToggleTodo}
            onRemoveTodo={onRemoveTodo}
            onEditTodo={onEditTodo}
            isTargetColumn={draggedToColumn === 'pending'}
            onDragUpdate={handleDragUpdate}
          />
          <Column
            title="Completed"
            todos={completedTodos}
            onToggleTodo={onToggleTodo}
            onRemoveTodo={onRemoveTodo}
            onEditTodo={onEditTodo}
            isTargetColumn={draggedToColumn === 'completed'}
            onDragUpdate={handleDragUpdate}
          />
        </ScrollView>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  wrapper: {
    flex: 1,
    position: 'relative',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    minWidth: '100%',
  },
  column: {
    width: 300,
    marginHorizontal: 8,
    height: '100%',
  },
  columnTitle: {
    marginVertical: 8,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
    borderRadius: 8,
    padding: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
});
