import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { LanguageProvider } from '../context/LanguageContext';

// Wrap with both LanguageProvider and MemoryRouter since
// Header and Sidebar use react-router <Link> components
const Providers = ({ children }) => (
  <MemoryRouter>
    <LanguageProvider>
      {children}
    </LanguageProvider>
  </MemoryRouter>
);

describe('Mobile Navigation Component Tests', () => {
  it('renders Hamburger button on Header and triggers onOpenMobileMenu', () => {
    const handleOpenMobile = vi.fn();
    render(
      <Providers>
        <Header
          isDarkMode={false}
          setIsDarkMode={() => {}}
          openSettings={() => {}}
          onOpenMobileMenu={handleOpenMobile}
        />
      </Providers>
    );

    const hamburgerBtn = screen.getByRole('button', { name: /open mobile menu/i });
    expect(hamburgerBtn).toBeInTheDocument();
    fireEvent.click(hamburgerBtn);
    expect(handleOpenMobile).toHaveBeenCalledTimes(1);
  });

  it('renders Mobile Drawer when isMobileOpen is true and closes on close button click', () => {
    const handleSetMobileOpen = vi.fn();
    const handleSetActiveTab = vi.fn();

    render(
      <Providers>
        <Sidebar
          activeTab="dashboard"
          setActiveTab={handleSetActiveTab}
          openSettings={() => {}}
          isCollapsed={false}
          setIsCollapsed={() => {}}
          isMobileOpen={true}
          setIsMobileOpen={handleSetMobileOpen}
        />
      </Providers>
    );

    const closeBtn = screen.getByRole('button', { name: /close menu/i });
    expect(closeBtn).toBeInTheDocument();
    fireEvent.click(closeBtn);
    expect(handleSetMobileOpen).toHaveBeenCalledWith(false);
  });

  it('closes mobile menu when a navigation item is clicked in Mobile Drawer', () => {
    const handleSetMobileOpen = vi.fn();
    const handleSetActiveTab = vi.fn();

    render(
      <Providers>
        <Sidebar
          activeTab="dashboard"
          setActiveTab={handleSetActiveTab}
          openSettings={() => {}}
          isCollapsed={false}
          setIsCollapsed={() => {}}
          isMobileOpen={true}
          setIsMobileOpen={handleSetMobileOpen}
        />
      </Providers>
    );

    const flashcardButtons = screen.getAllByRole('button', { name: /flashcard/i });
    expect(flashcardButtons.length).toBeGreaterThan(0);
    fireEvent.click(flashcardButtons[0]);

    expect(handleSetActiveTab).toHaveBeenCalledWith('flashcard');
    expect(handleSetMobileOpen).toHaveBeenCalledWith(false);
  });
});
