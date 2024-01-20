import React, { useEffect, useState } from 'react';
import githubLogo from './assets/github.svg';
import linkedinLogo from './assets/linkedin.svg';
import alienImage from './assets/alien.png';
import './App.css';

function App() {
  const sentences = [
    "Cybersecurity enthusiast 👨🏻‍💻",
    "Passionate about AI 🧠",
    "In love with learning new things.",
    "Problem solver.",
  ];
  
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [currentSentence, setCurrentSentence] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  
  useEffect(() => {
    const typingInterval = setInterval(() => {
      if (isTyping) {
        if (currentIndex < sentences[currentSentenceIndex].length) {
          setCurrentSentence(prevSentence => prevSentence + sentences[currentSentenceIndex][currentIndex]);
          setCurrentIndex(currentIndex + 1);
        } else {
          setIsTyping(false);
        }
      } else {
        if (currentIndex > 0) {
          setCurrentSentence(prevSentence => prevSentence.slice(0, -1));
          setCurrentIndex(currentIndex - 1);
        } else {
          setIsTyping(true);
          setCurrentSentence(''); // Clear the sentence
          setCurrentSentenceIndex((currentSentenceIndex + 1) % sentences.length); // Move to the next sentence
        }
      }
    }, 100); // Adjust the typing speed by changing the delay (in milliseconds)
  
    return () => {
      clearInterval(typingInterval);
    };
  }, [currentIndex, currentSentence, currentSentenceIndex, isTyping, sentences]);

  return (
    <div className="container">
      <div className="content">
        <a href="https://github.com/marcobarca" target="_blank">
          <img
            src={githubLogo}
            className="social-logo"
            alt="GitHub logo"
          />
        </a>
        <a href="https://www.linkedin.com/in/marco-barca-9a6b49a5/" target="_blank">
          <img
            src={linkedinLogo}
            className="social-logo"
            alt="LinkedIn logo"
          />
        </a>
      </div>
      <div className="content">
        <img
          src={alienImage}
          className="logo alien"
          alt="Alien"
        />
        <h1 className="name">Marco Barca</h1>
        <h2 className="profession">Computer Engineer</h2>
        <div className="typing-text">
          <p>
            <span className="static-symbol" style={{ color: 'white' }}>&gt; </span> {currentSentence}
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
