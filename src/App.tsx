/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useRef, useState } from 'react';
import { UserWarning } from './UserWarning';
import {
  getTodos,
  USER_ID,
  deleteTodo,
  addTodo,
  updateTodo,
} from './api/todos';

import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Todo } from './types/Todo';
import { Filters } from './types/Filtres';
import { ErrorNotification } from './components/ErrorNotification';
import { filterTodos } from './utils/filterTodos';
import { ErrorType } from './types/ErrorType';
import { TodoList } from './components/TodoList';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [errorMessage, setErrorMessage] = useState<ErrorType>(ErrorType.Empty);
  const [currentFilter, setCurrentFilter] = useState<Filters>(Filters.All);
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [loadingTodoIds, setLoadingTodoIds] = useState<number[]>([]);
  const [, setIsToggleAllActive] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const disabledTodo = todos.every(todo => !todo.completed);

  const activeTodos = todos.filter(todo => !todo.completed).length;
  const filteredTodos = filterTodos(todos, currentFilter);
  const areAllTodosCompleted = todos.every(todo => todo.completed);

  const onAddTodo = async (todoTitle: string) => {
    setTempTodo({
      id: 0,
      title: todoTitle,
      completed: false,
      userId: USER_ID,
    });
    try {
      const newTodo = await addTodo({ title: todoTitle, completed: false });

      setTodos(prev => [...prev, newTodo]);
    } catch (err) {
      setErrorMessage(ErrorType.AddTodo);
      throw err;
    } finally {
      setTempTodo(null);
    }
  };

  const onDeleteTodo = async (todoId: number) => {
    setLoadingTodoIds(prev => [...prev, todoId]);
    try {
      await deleteTodo(todoId);

      setTodos(prev => prev.filter(todo => todo.id !== todoId));
    } catch (err) {
      setErrorMessage(ErrorType.DeleteTodo);
      throw err;
    } finally {
      setLoadingTodoIds(prev => prev.filter(id => id !== todoId));
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleClearCompleted = async () => {
    const completedTodos = todos.filter(todo => todo.completed);

    setLoadingTodoIds(prev => [
      ...prev,
      ...completedTodos.map(todo => todo.id),
    ]);

    try {
      const successfulDeletes: number[] = [];

      await Promise.all(
        completedTodos.map(todo =>
          deleteTodo(todo.id)
            .then(() => {
              successfulDeletes.push(todo.id);
            })
            .catch(() => {
              setErrorMessage(ErrorType.DeleteTodo);
            }),
        ),
      );

      setTodos(prevTodos =>
        prevTodos.filter(todo => !successfulDeletes.includes(todo.id)),
      );
    } catch (error) {
      setErrorMessage(ErrorType.DeleteTodo);
    } finally {
      setLoadingTodoIds(prev =>
        prev.filter(id => !completedTodos.some(todo => todo.id === id)),
      );

      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const onUpdateTodo = async (todoToUpdate: Todo) => {
    setLoadingTodoIds(prev => [...prev, todoToUpdate.id]);
    try {
      const updatedTodo = await updateTodo(todoToUpdate);

      setTodos(prev =>
        prev.map(todo => (todo.id === updatedTodo.id ? updatedTodo : todo)),
      );
    } catch (err) {
      setErrorMessage(ErrorType.UpdateTodo);
      throw err;
    } finally {
      setLoadingTodoIds(prev => prev.filter(id => id !== todoToUpdate.id));
    }
  };

  const onToggleAll = async () => {
    setIsToggleAllActive(prevState => !prevState);
    if (activeTodos > 0) {
      const todosActive = todos.filter(todo => !todo.completed);

      todosActive.forEach(todo => {
        onUpdateTodo({ ...todo, completed: true });
      });
    } else {
      todos.forEach(todo => {
        onUpdateTodo({ ...todo, completed: false });
      });
    }
  };

  useEffect(() => {
    getTodos()
      .then(data => {
        setTodos(data);
      })
      .catch(() => {
        setErrorMessage(ErrorType.LoadTodos);
      });
  }, []);

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <Header
          onAddTodo={onAddTodo}
          setErrorMessage={setErrorMessage}
          inputRef={inputRef}
          onToggleAll={onToggleAll}
          todoLength={todos.length}
          areAllTodosCompleted={areAllTodosCompleted}
        />

        {todos.length !== 0 && (
          <>
            <TodoList
              filteredTodos={filteredTodos}
              onDeleteTodo={onDeleteTodo}
              onUpdateTodo={onUpdateTodo}
              loadingTodoIds={loadingTodoIds}
              tempTodo={tempTodo}
            />
            <Footer
              activeTodos={activeTodos}
              disabledTodo={disabledTodo}
              currentFilter={currentFilter}
              setCurrentFilter={setCurrentFilter}
              handleClearCompleted={handleClearCompleted}
            />
          </>
        )}
      </div>

      <ErrorNotification error={errorMessage} setError={setErrorMessage} />
    </div>
  );
};
