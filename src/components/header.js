import { Link } from 'react-router-dom';
import '../styles/components/_header.scss';

function Header({ singleTypes }) {
  return (
    <header className="App-header">
      <div className="header-content">
        <Link to="/" className="site-name">JONMIKKELHANSEN</Link>
        <nav>
          {singleTypes.map(type => (
            <Link
              key={type.uid}
              to={`/${type.uid}`}
              className="nav-link"
            >
              {type.displayName}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export default Header;
