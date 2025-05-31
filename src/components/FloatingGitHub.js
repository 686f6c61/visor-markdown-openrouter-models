import React from 'react';
import { Github } from 'lucide-react';
import './FloatingGitHub.css';

const FloatingGitHub = () => {
  const githubRepo = process.env.REACT_APP_GITHUB_REPO;

  if (!githubRepo) {
    return null;
  }

  return (
    <a
      href={githubRepo}
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
