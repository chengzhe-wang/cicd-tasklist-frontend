import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTasks } from '../hooks/useTasks';
import * as taskApi from '../api/taskApi';

vi.mock('../api/taskApi', () => ({
	getTasks: vi.fn(),
	createTask: vi.fn(),
	updateTask: vi.fn(),
	deleteTask: vi.fn(),
}));

const mockTask = {
	id: 1,
	title: 'Initiale',
	description: 'Desc',
	completed: false,
	createdAt: '2026-01-15T10:00:00Z',
	updatedAt: '2026-01-15T10:00:00Z',
};

describe('useTasks', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('loads tasks on mount', async () => {
		vi.mocked(taskApi.getTasks).mockResolvedValue([mockTask]);

		const { result } = renderHook(() => useTasks());

		expect(result.current.loading).toBe(true);

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.tasks).toEqual([mockTask]);
		expect(result.current.error).toBeNull();
		expect(taskApi.getTasks).toHaveBeenCalledTimes(1);
	});

	it('stores an error when loading fails', async () => {
		vi.mocked(taskApi.getTasks).mockRejectedValue(new Error('load failed'));

		const { result } = renderHook(() => useTasks());

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		expect(result.current.error).toBe('load failed');
		expect(result.current.tasks).toEqual([]);
	});

	it('adds, edits, removes and toggles tasks', async () => {
		vi.mocked(taskApi.getTasks).mockResolvedValue([mockTask]);
		vi.mocked(taskApi.createTask).mockResolvedValue({
			id: 2,
			title: 'Ajoutée',
			description: null,
			completed: false,
			createdAt: '2026-01-17T10:00:00Z',
			updatedAt: '2026-01-17T10:00:00Z',
		});
		vi.mocked(taskApi.updateTask).mockResolvedValue({
			...mockTask,
			title: 'Mise à jour',
			completed: true,
		});
		vi.mocked(taskApi.deleteTask).mockResolvedValue(undefined);

		const { result } = renderHook(() => useTasks());

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		await act(async () => {
			await result.current.addTask({ title: 'Ajoutée', description: '' });
		});

		expect(result.current.tasks[0].title).toBe('Ajoutée');

		await act(async () => {
			await result.current.toggleComplete(1);
		});

		expect(taskApi.updateTask).toHaveBeenCalledWith(1, { completed: true });

		await act(async () => {
			await result.current.editTask(1, { title: 'Mise à jour', completed: true });
		});

		expect(result.current.tasks.find((task) => task.id === 1)?.title).toBe('Mise à jour');

		await act(async () => {
			await result.current.removeTask(1);
		});

		expect(result.current.tasks.find((task) => task.id === 1)).toBeUndefined();
	});

	it('ignores toggle requests for missing tasks', async () => {
		vi.mocked(taskApi.getTasks).mockResolvedValue([]);

		const { result } = renderHook(() => useTasks());

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		await act(async () => {
			await result.current.toggleComplete(999);
		});

		expect(taskApi.updateTask).not.toHaveBeenCalled();
	});
});
