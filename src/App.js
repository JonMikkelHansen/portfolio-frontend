import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import './styles/main.scss';
import styled from 'styled-components';
import PortfolioGrid from './components/PortfolioGrid';

// You can still use Styled Components alongside SCSS
const HeaderWrapper = styled.header`
  background-color: #000000;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
`;

const MainContent = styled.main`
  background-color: #000000;
  margin-top: 60px;
  min-height: calc(100vh - 60px);
`;

function App() {
  const [singleTypes, setSingleTypes] = useState([]);

  useEffect(() => {
    const fetchSingleTypes = async () => {
      const typesToFetch = [
        { uid: 'portfolio', displayName: 'Portfolio' },
        { uid: 'career', displayName: 'Career' },
        { uid: 'personal', displayName: 'Personal' }
      ];
      
      try {
        const publishedTypes = [];
        
        for (const type of typesToFetch) {
          const response = await fetch(
            `${process.env.REACT_APP_API_URL}/api/${type.uid}?publicationState=live`,
            {
              headers: {
                'Authorization': `Bearer ${process.env.REACT_APP_STRAPI_API_TOKEN}`
              }
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data.data) {
              publishedTypes.push(type);
            }
          }
        }

        setSingleTypes(publishedTypes);
        
      } catch (error) {
        console.error('Error fetching single types:', error);
      }
    };

    fetchSingleTypes();
  }, []);

  return (
    <BrowserRouter>
      <div className="App">
        <HeaderWrapper>
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
        </HeaderWrapper>
        
        <MainContent>
          <Routes>
            {/* Routes remain the same */}
            <Route path="/" element={<Navigate to="/portfolio" replace />} />
            <Route path="/portfolio" element={<PortfolioGrid />} />
            <Route path="/career" element={<div>Career Content</div>} />
            <Route path="/personal" element={<div>Personal Content</div>} />
          </Routes>
        </MainContent>
      </div>
    </BrowserRouter>
  );
}

export default App;


