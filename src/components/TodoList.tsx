import React, { useState } from 'react';
import { TodoItem } from './TodoItem';
import { Todo } from '../types/Todo';

type Props = {
  filteredTodos: Todo[];
  loadingTodoIds: number[];
  tempTodo: Todo | null;
  handleDeleteTodo: (todoId: number) => Promise<void>;
  handleUpdateTodo: (todo: Todo) => Promise<void>;
};

export const TodoList: React.FC<Props> = props => {
  const {
    filteredTodos,
    loadingTodoIds,
    tempTodo,
    handleDeleteTodo,
    handleUpdateTodo,
  } = props;

  const [editedTodo, setEditedTodo] = useState<null | number>(null);

  return (
    <section className="todoapp__main" data-cy="TodoList">
      {filteredTodos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          handleDeleteTodo={handleDeleteTodo}
          handleUpdateTodo={handleUpdateTodo}
          isLoading={loadingTodoIds.includes(todo.id)}
          isInEditMode={editedTodo === todo.id}
          setEditedTodo={setEditedTodo}
        />
      ))}
      {tempTodo && (
        <TodoItem
          todo={tempTodo}
          handleDeleteTodo={handleDeleteTodo}
          handleUpdateTodo={handleUpdateTodo}
          isLoading
        />
      )}
    </section>
  );
};
