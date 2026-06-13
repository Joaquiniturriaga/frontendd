// src/test/components/atoms/ActionButton.spec.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ActionButton from '../../../components/ActionButton/ActionButton';

describe('ActionButton Component', () => {

  it('renderiza el botón correctamente', () => {
    const { getByText } = render(
      <ActionButton label="Reportar incendio" sub="Fuego activo ahora" icon="🔥" />
    );
    expect(getByText('Reportar incendio')).toBeTruthy();
  });

  it('renderiza el subtítulo correctamente', () => {
    render(
      <ActionButton label="Reportar incendio" sub="Fuego activo ahora" icon="🔥" />
    );
    expect(screen.getByText('Fuego activo ahora')).toBeTruthy();
  });

  it('renderiza el ícono correctamente', () => {
    render(
      <ActionButton label="Reportar incendio" sub="Fuego activo ahora" icon="🔥" />
    );
    expect(screen.getByText('🔥')).toBeTruthy();
  });

  it('aplica la clase de variante correctamente', () => {
    render(
      <ActionButton label="Reportar incendio" sub="Fuego activo ahora" icon="🔥" variant="red" />
    );
    const btn = screen.getByText('Reportar incendio').closest('button');
    expect(btn).toHaveClass('action-button--red');
  });

  it('aplica la variante orange correctamente', () => {
    render(
      <ActionButton label="Foco" sub="Humo sospechoso" icon="⚠️" variant="orange" />
    );
    const btn = screen.getByText('Foco').closest('button');
    expect(btn).toHaveClass('action-button--orange');
  });

  it('ejecuta onClick al hacer click', () => {
    const mockClick = jasmine.createSpy('onClick');
    render(
      <ActionButton label="Reportar" sub="sub" icon="🔥" onClick={mockClick} />
    );
    const btn = screen.getByText('Reportar').closest('button');
    fireEvent.click(btn);
    expect(mockClick).toHaveBeenCalled();
  });

});
