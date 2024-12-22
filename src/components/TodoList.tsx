import React, { useState } from 'react';
import { TodoItem } from './TodoItem';
import { Todo } from '../types/Todo';

type Props = {
  filteredTodos: Todo[];
  loadingTodoIds: number[];
  tempTodo: Todo | null;
  onDeleteTodo: (todoId: number) => Promise<void>;
  onUpdateTodo: (todo: Todo) => Promise<void>;
};

export const TodoList: React.FC<Props> = props => {
  const {
    filteredTodos,
    loadingTodoIds,
    tempTodo,
    onDeleteTodo,
    onUpdateTodo,
  } = props;

  const [editedTodo, setEditedTodo] = useState<null | number>(null);

  return (
    <section className="todoapp__main" data-cy="TodoList">
      {filteredTodos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onDeleteTodo={onDeleteTodo}
          onUpdateTodo={onUpdateTodo}
          isLoading={loadingTodoIds.includes(todo.id)}
          isInEditMode={editedTodo === todo.id}
          setEditedTodo={setEditedTodo}
        />
      ))}
      {tempTodo && (
        <TodoItem
          todo={tempTodo}
          onDeleteTodo={onDeleteTodo}
          onUpdateTodo={onUpdateTodo}
          isLoading
        />
      )}
    </section>
  );
};
