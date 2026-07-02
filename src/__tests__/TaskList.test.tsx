import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TaskList } from '../components/TaskList';
import type { Task } from '../types/task';

const mockTasks: Task[] = [
	{
		id: 1,
		title: 'Première tâche',
		description: 'Description 1',
		completed: false,
		createdAt: '2026-01-15T10:00:00Z',
		updatedAt: '2026-01-15T10:00:00Z',
	},
	{
		id: 2,
		title: 'Deuxième tâche',
		description: null,
		completed: true,
		createdAt: '2026-01-16T10:00:00Z',
		updatedAt: '2026-01-16T10:00:00Z',
	},
];

describe('TaskList', () => {
	it('shows loading state', () => {
		render(
			<TaskList
				tasks={[]}
				loading={true}
				error={null}
				onToggle={vi.fn()}
				onDelete={vi.fn()}
				onEdit={vi.fn()}
			/>
		);
		expect(screen.getByTestId('loading')).toBeInTheDocument();
		expect(screen.getByText('Chargement des tâches...')).toBeInTheDocument();
	});

	it('renders list of tasks', () => {
		render(
			<TaskList
				tasks={mockTasks}
				loading={false}
				error={null}
				onToggle={vi.fn()}
				onDelete={vi.fn()}
				onEdit={vi.fn()}
			/>
		);
		expect(screen.getByTestId('task-list')).toBeInTheDocument();
		expect(screen.getByText('Première tâche')).toBeInTheDocument();
		expect(screen.getByText('Deuxième tâche')).toBeInTheDocument();
		expect(screen.getByText('2 tâches')).toBeInTheDocument();
	});

	it('shows empty state when there are no tasks', () => {
		render(
			<TaskList
				tasks={[]}
				loading={false}
				error={null}
				onToggle={vi.fn()}
				onDelete={vi.fn()}
				onEdit={vi.fn()}
			/>
		);

		expect(screen.getByTestId('empty')).toBeInTheDocument();
		expect(screen.getByText('Aucune tâche')).toBeInTheDocument();
	});

	it('shows error state', () => {
		render(
			<TaskList
				tasks={[]}
				loading={false}
				error="Impossible de charger"
				onToggle={vi.fn()}
				onDelete={vi.fn()}
				onEdit={vi.fn()}
			/>
		);

		expect(screen.getByTestId('error')).toBeInTheDocument();
		expect(screen.getByText('Erreur : Impossible de charger')).toBeInTheDocument();
	});

	it('passes callbacks to task items', () => {
		const onToggle = vi.fn();
		const onDelete = vi.fn();
		const onEdit = vi.fn();

		render(
			<TaskList
				tasks={mockTasks}
				loading={false}
				error={null}
				onToggle={onToggle}
				onDelete={onDelete}
				onEdit={onEdit}
			/>
		);

		fireEvent.click(screen.getAllByRole('checkbox')[0]);
		fireEvent.click(screen.getAllByRole('button', { name: 'Modifier' })[0]);

		expect(onToggle).toHaveBeenCalledWith(1);
		expect(screen.getByLabelText('Modifier le titre')).toBeInTheDocument();
	});
});
