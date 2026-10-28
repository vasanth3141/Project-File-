import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the todo app heading', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /my todo list/i })).toBeInTheDocument();
});
