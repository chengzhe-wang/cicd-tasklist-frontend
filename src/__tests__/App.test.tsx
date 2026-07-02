import { fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const useTasksMock = vi.hoisted(() => vi.fn());
const taskFormMock = vi.hoisted(() => vi.fn());
const taskListMock = vi.hoisted(() => vi.fn());

vi.mock('../hooks/useTasks', () => ({
	useTasks: useTasksMock,
}));

vi.mock('../components/TaskForm', () => ({
	TaskForm: (props: { onSubmit: (data: { title: string; description?: string }) => Promise<void> | void }) => {
		taskFormMock(props);
		return (
			<button type="button" onClick={() => props.onSubmit({ title: 'Nouvelle tâche', description: 'Démo' })}>
				Ajouter une tâche
			</button>
		);
	},
}));

vi.mock('../components/TaskList', () => ({
	TaskList: (props: unknown) => {
		taskListMock(props);
		return <div data-testid="task-list-mock" />;
	},
}));

import App from '../App';

describe('App', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders header stats when tasks exist', () => {
		useTasksMock.mockReturnValue({
			tasks: [
				{
					id: 1,
					title: 'Terminé',
					description: null,
					completed: true,
					createdAt: '2026-01-15T10:00:00Z',
					updatedAt: '2026-01-15T10:00:00Z',
				},
				{
					id: 2,
					title: 'En cours',
					description: null,
					completed: false,
					createdAt: '2026-01-16T10:00:00Z',
					updatedAt: '2026-01-16T10:00:00Z',
				},
			],
			loading: false,
			error: null,
			addTask: vi.fn(),
			editTask: vi.fn(),
			removeTask: vi.fn(),
			toggleComplete: vi.fn(),
		});

		const { container } = render(<App />);

		expect(screen.getByText('Mes Tâches')).toBeInTheDocument();
		expect(container.querySelector('.stat-value')?.textContent).toBe('2');
		expect(container.querySelector('.stat-success')?.textContent).toBe('1');
		expect(container.querySelector('.stat-pending')?.textContent).toBe('1');
		expect(taskListMock).toHaveBeenCalled();
	});

	it('submits a new task through useTasks and ignores rejected addTask errors', async () => {
		const addTask = vi.fn().mockRejectedValue(new Error('boom'));
		const editTask = vi.fn();
		const removeTask = vi.fn();
		const toggleComplete = vi.fn();

		useTasksMock.mockReturnValue({
			tasks: [],
			loading: false,
			error: null,
			addTask,
			editTask,
			removeTask,
			toggleComplete,
		});

		render(<App />);

		await fireEvent.click(screen.getByRole('button', { name: 'Ajouter une tâche' }));

		expect(addTask).toHaveBeenCalledWith({
			title: 'Nouvelle tâche',
			description: 'Démo',
		});
		expect(screen.getByText('Mes Tâches')).toBeInTheDocument();
	});
});
