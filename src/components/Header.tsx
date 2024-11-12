import { Link } from 'react-router-dom';
import '../styles/components/_header.scss';

interface SingleType {
  uid: string;
  displayName: string;
}

interface HeaderProps {
  singleTypes: SingleType[];
}

function Header({ singleTypes }: HeaderProps) {
  return (
    <header className="App-header">
      <div className="header-content">
        <Link to="/" className="site-name">JON<span className="emphasis">MIKKEL</span>HANSEN</Link>
        <nav>
          {singleTypes.map((type: SingleType) => (
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
