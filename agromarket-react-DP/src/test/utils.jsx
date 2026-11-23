import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';      // в React Router 7: 'react-router'
import { AuthProvider } from '../context/AuthContext'; // путь и имя — как у вас

export function renderWithProviders(ui, { route = '/' } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>{ui}</AuthProvider>
    </MemoryRouter>
  );
}
