import githubLogo from './assets/github.svg'
import linkedinLogo from './assets/linkedin.svg'
import alienImage from './assets/alien.png';

import './App.css'

function App() {

  return (
    <>
      <div className='back'>
        <div>
          <a target="_blank">
            <img
              src={alienImage}
              className="logo alien"
              alt="Alien"
              style={{ width: '300px', height: '300px' }} // Adjust the width and height as needed
            />
          </a>

        </div>
        <h1 className='name'>Marco Barca</h1>
        <h2 className='profession'>Computer Engineer</h2>
        <div className="social-icons">
          <a href="https://github.com/marcobarca" target="_blank">
            <img src={githubLogo} className="social-logo" alt="GitHub logo" />
          </a>
          <a href="https://www.linkedin.com/in/marco-barca-9a6b49a5/" target="_blank">
            <img src={linkedinLogo} className="social-logo" alt="LinkedIn logo" />
          </a>
        </div>
      </div>
    </>
  )
}

export default App
