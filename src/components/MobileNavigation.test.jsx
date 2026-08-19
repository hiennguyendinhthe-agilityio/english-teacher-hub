import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Sidebar from './Sidebar';
import Header from './Header';
import { LanguageProvider } from '../context/LanguageContext';

describe('Mobile Navigation Component Tests', () => {
  it('renders Hamburger button on Header and triggers onOpenMobileMenu', () => {
    const handleOpenMobile = vi.fn();
    render(
      <LanguageProvider>
        <Header 
          isDarkMode={false} 
          setIsDarkMode={() => {}} 
          openSettings={() => {}} 
          onOpenMobileMenu={handleOpenMobile} 
        />
      </LanguageProvider>
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
      <LanguageProvider>
        <Sidebar
          activeTab="dashboard"
          setActiveTab={handleSetActiveTab}
          openSettings={() => {}}
          isCollapsed={false}
          setIsCollapsed={() => {}}
          isMobileOpen={true}
          setIsMobileOpen={handleSetMobileOpen}
        />
      </LanguageProvider>
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
      <LanguageProvider>
        <Sidebar
          activeTab="dashboard"
          setActiveTab={handleSetActiveTab}
          openSettings={() => {}}
          isCollapsed={false}
          setIsCollapsed={() => {}}
          isMobileOpen={true}
          setIsMobileOpen={handleSetMobileOpen}
        />
      </LanguageProvider>
    );

    const flashcardButtons = screen.getAllByRole('button', { name: /flashcard/i });
    expect(flashcardButtons.length).toBeGreaterThan(0);
    fireEvent.click(flashcardButtons[0]);

    expect(handleSetActiveTab).toHaveBeenCalledWith('flashcard');
    expect(handleSetMobileOpen).toHaveBeenCalledWith(false);
  });
});
