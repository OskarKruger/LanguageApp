import React from 'react';
import './CSS/light-mode.css';
import './CSS/dark-mode.css';
import LanguageSelector from './LanguageSelector';
import Navbar from './NavbarElement'; // Adjust the import path as needed


function App() {
  return (
    <div>
      <Navbar />
    <div className="App">
      <header className="App-header">
        <LanguageSelector />
      </header>
    </div>
  </div>
  );
}

export default App;
