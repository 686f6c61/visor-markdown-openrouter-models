import React from 'react';
import { Github } from 'lucide-react';
import './FloatingGitHub.css';

const FloatingGitHub = () => {
  return (
    <a
      href="https://github.com/686f6c61/visor-markdown-vitaminado"
      target="_blank"
      rel="noopener noreferrer"
      className="floating-github"
      title="Ver código en GitHub"
      aria-label="Ver código en GitHub"
    >
      <Github size={24} />
    </a>
  );
};

export default FloatingGitHub;
