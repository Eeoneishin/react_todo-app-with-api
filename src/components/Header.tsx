import React, { useEffect, useState } from 'react';
import { ErrorType } from '../types/ErrorType';
import cn from 'classnames';

type Props = {
  onAddTodo: (value: string) => Promise<void>;
  setErrorMessage: React.Dispatch<React.SetStateAction<ErrorType>>;
  inputRef: React.RefObject<HTMLInputElement>;
  todoLength: number;
  onToggleAll: () => Promise<void>;
  areAllTodosCompleted: boolean;
};

export const Header: React.FC<Props> = props => {
  const {
    onAddTodo,
    setErrorMessage,
    inputRef,
    onToggleAll,
    todoLength,
    areAllTodosCompleted,
  } = props;

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inputValue.trim() === '') {
      setErrorMessage(ErrorType.EmptyTitle);

      return;
    }

    setIsLoading(true);

    try {
      await onAddTodo(inputValue.trim());
      setInputValue('');
    } catch (error) {
      setErrorMessage(ErrorType.AddTodo);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputRef, isLoading, todoLength]);

  return (
    <header className="todoapp__header">
      {todoLength > 0 && (
        <button
          type="button"
          className={cn('todoapp__toggle-all', {
            active: areAllTodosCompleted,
          })}
          data-cy="ToggleAllButton"
          onClick={onToggleAll}
        />
      )}

      <form onSubmit={onSubmit}>
        <input
          data-cy="NewTodoField"
          type="text"
          className="todoapp__new-todo"
          placeholder="What needs to be done?"
          ref={inputRef}
          value={inputValue}
          onChange={event => setInputValue(event.target.value)}
          disabled={isLoading}
        />
      </form>
    </header>
  );
};
