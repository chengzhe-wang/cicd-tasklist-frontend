import { fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TaskForm } from '../components/TaskForm';

describe('TaskForm', () => {
	it('submits trimmed values and resets in create mode', () => {
		const onSubmit = vi.fn();
		render(<TaskForm onSubmit={onSubmit} />);

		fireEvent.change(screen.getByLabelText('Titre'), {
			target: { value: '  Nouvelle tâche  ' },
		});
		fireEvent.change(screen.getByLabelText('Description'), {
			target: { value: '  Une description  ' },
		});
		fireEvent.submit(screen.getByTestId('task-form'));

		expect(onSubmit).toHaveBeenCalledWith({
			title: 'Nouvelle tâche',
			description: 'Une description',
		});
		expect(screen.getByLabelText('Titre')).toHaveValue('');
		expect(screen.getByLabelText('Description')).toHaveValue('');
	});

	it('shows a validation error when title is empty', () => {
		const onSubmit = vi.fn();
		render(<TaskForm onSubmit={onSubmit} />);

		fireEvent.submit(screen.getByTestId('task-form'));

		expect(onSubmit).not.toHaveBeenCalled();
		expect(screen.getByRole('alert')).toHaveTextContent('Le titre est requis');
	});

	it('renders edit mode and calls onCancel', () => {
		const onSubmit = vi.fn();
		const onCancel = vi.fn();

		render(
			<TaskForm
				onSubmit={onSubmit}
				onCancel={onCancel}
				mode="edit"
				initialValues={{ title: 'Titre existant', description: 'Desc' }}
			/>
		);

		expect(screen.getByText('Modifier la tâche')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Modifier' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Annuler' })).toBeInTheDocument();

		fireEvent.click(screen.getByRole('button', { name: 'Annuler' }));

		expect(onCancel).toHaveBeenCalledTimes(1);
	});
});
