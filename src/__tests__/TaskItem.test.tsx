import { fireEvent, render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TaskItem } from '../components/TaskItem';
import type { Task } from '../types/task';

const task: Task = {
	id: 1,
	title: 'Ma tâche',
	description: 'Une description',
	completed: false,
	createdAt: '2026-01-15T10:00:00Z',
	updatedAt: '2026-01-15T10:00:00Z',
};

describe('TaskItem', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.clearAllTimers();
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	it('renders task content', () => {
		render(
			<TaskItem task={task} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />
		);

		expect(screen.getByText('Ma tâche')).toBeInTheDocument();
		expect(screen.getByText('Une description')).toBeInTheDocument();
		expect(screen.getByText(/15 janvier 2026/i)).toBeInTheDocument();
	});

	it('renders completed task state', () => {
		render(
			<TaskItem
				task={{ ...task, completed: true, description: null }}
				onToggle={vi.fn()}
				onDelete={vi.fn()}
				onEdit={vi.fn()}
			/>
		);

		expect(screen.getByTestId('task-item')).toHaveClass('task-completed');
		expect(screen.queryByText('Une description')).not.toBeInTheDocument();
	});

	it('switches to edit mode and saves changes', () => {
		const onEdit = vi.fn();
		render(
			<TaskItem task={task} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={onEdit} />
		);

		fireEvent.click(screen.getByRole('button', { name: 'Modifier' }));
		fireEvent.change(screen.getByLabelText('Modifier le titre'), {
			target: { value: '  Titre modifié  ' },
		});
		fireEvent.change(screen.getByLabelText('Modifier la description'), {
			target: { value: '  Nouvelle desc  ' },
		});
		fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

		expect(onEdit).toHaveBeenCalledWith(1, {
			title: 'Titre modifié',
			description: 'Nouvelle desc',
		});
	});

	it('cancels edit mode without saving', () => {
		const onEdit = vi.fn();
		render(
			<TaskItem task={task} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={onEdit} />
		);

		fireEvent.click(screen.getByRole('button', { name: 'Modifier' }));
		fireEvent.change(screen.getByLabelText('Modifier le titre'), {
			target: { value: 'Autre titre' },
		});
		fireEvent.click(screen.getByRole('button', { name: 'Annuler' }));

		expect(onEdit).not.toHaveBeenCalled();
		expect(screen.getByText('Ma tâche')).toBeInTheDocument();
	});

	it('handles delete confirmation flow', () => {
		const onDelete = vi.fn();
		render(
			<TaskItem task={task} onToggle={vi.fn()} onDelete={onDelete} onEdit={vi.fn()} />
		);

		fireEvent.click(screen.getByRole('button', { name: 'Supprimer' }));
		expect(screen.getByRole('button', { name: 'Supprimer' })).toHaveTextContent('⚠️');
		expect(onDelete).not.toHaveBeenCalled();

		fireEvent.click(screen.getByRole('button', { name: 'Supprimer' }));
		expect(onDelete).toHaveBeenCalledWith(1);
	});

	it('toggles completion', () => {
		const onToggle = vi.fn();
		render(
			<TaskItem task={task} onToggle={onToggle} onDelete={vi.fn()} onEdit={vi.fn()} />
		);

		fireEvent.click(screen.getByRole('checkbox'));

		expect(onToggle).toHaveBeenCalledWith(1);
	});

	it('clears delete confirmation after timeout', () => {
		const onDelete = vi.fn();
		render(
			<TaskItem task={task} onToggle={vi.fn()} onDelete={onDelete} onEdit={vi.fn()} />
		);

		const deleteButton = screen.getByRole('button', { name: 'Supprimer' });
		fireEvent.click(deleteButton);
		expect(deleteButton).toHaveTextContent('⚠️');

		act(() => {
			vi.advanceTimersByTime(3000);
		});
		expect(screen.getByRole('button', { name: 'Supprimer' })).toHaveTextContent('🗑️');
	});
});
