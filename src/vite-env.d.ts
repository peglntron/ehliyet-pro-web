/// <reference types="vite/client" />

// Custom events için type tanımlaması
declare global {
  interface WindowEventMap {
    'logoUpdated': CustomEvent;
  }
}
