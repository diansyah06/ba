import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRouter from './router/AppRouter';

function App() {
  return (
    // Router hanya boleh dipanggil SATU KALI disini (Root Level)
    <Router>
      <AppRouter />
    </Router>
  );
}

export default App;