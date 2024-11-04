import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import '../styles/components/PortfolioGrid.scss';
import LightBox from './LightBox';

const GridContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  padding: 0;
  margin: 0;
`;

const Grid = styled.div`
  display: grid;
  padding: 0;
  gap: 0;
  
  // Mobile (2 columns for 1:1, full width for 2:1)
  grid-template-columns: repeat(2, 1fr);
  
  // Desktop (5 columns)
  @media (min-width: 1024px) {
    grid-template-columns: repeat(5, 1fr);
  }
`;

const Case = styled.div`
  position: relative;
  background: #2a2a2a;
  grid-column: ${props => props.format === 'Wide' ? '1 / -1' : 'span 1'};
  opacity: 0;
  animation: fadeIn 0.5s ease-in forwards;
  animation-delay: ${props => props.index * 0.1}s;
  
  // Only add hover effects if case is clickable
  ${props => props.isClickable && `
    cursor: pointer;
    
    &:hover {
      .thumbnail-overlay {
        opacity: 0.3;
      }
    }
  `}
  
  @media (min-width: 1024px) {
    grid-column: ${props => props.format === 'Wide' ? 'span 2' : 'span 1'};
  }
  
  &:before {
    content: '';
    display: block;
    padding-top: ${props => props.format === 'Wide' ? '50%' : '100%'};
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translate(20px, 20px);
    }
    to {
      opacity: 1;
      transform: translate(0, 0);
    }
  }
`;
const Thumbnail = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ThumbnailOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: white;
  opacity: 0;
  transition: opacity 0.3s ease;
`;

function PortfolioGrid() {
  const [cases, setCases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const PRELOAD_COUNT = 5; // Number of images to preload
  const [selectedCase, setSelectedCase] = useState(null);

  useEffect(() => {
    const preloadImages = async (items) => {
      const preloadPromises = items
        .slice(0, PRELOAD_COUNT)
        .map(item => {
          if (item.Thumbnails?.[0]?.url) {
            return new Promise((resolve, reject) => {
              const img = new Image();
              img.src = `${process.env.REACT_APP_API_URL}${item.Thumbnails[0].url}`;
              img.onload = resolve;
              img.onerror = reject;
            });
          }
          return Promise.resolve();
        });

      try {
        await Promise.all(preloadPromises);
        setIsLoading(false);
      } catch (error) {
        console.error('Error preloading images:', error);
        setIsLoading(false); // Still show content even if preload fails
      }
    };

    const fetchCases = async () => {
      try {
        const url = `${process.env.REACT_APP_API_URL}/api/cases?populate=*`;
        console.log('API URL:', process.env.REACT_APP_API_URL);
        console.log('Token Preview:', process.env.REACT_APP_STRAPI_API_TOKEN?.substring(0, 5) + '...');
        console.log('Fetching from:', url);
        
        const headers = {
          'Authorization': `Bearer ${process.env.REACT_APP_STRAPI_API_TOKEN}`,
          'Content-Type': 'application/json'
        };
        console.log('Authorization Header:', headers.Authorization);
        
        const response = await fetch(url, { headers });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.log('API Error Response:', errorData);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const casesData = data.data || [];
        setCases(casesData);
        await preloadImages(casesData);
      } catch (error) {
        console.error('Error fetching cases:', error);
        console.error('Error details:', error.message);
        setIsLoading(false);
      }
    };

    fetchCases();
  }, []);

  const handleCaseClick = (caseItem) => {
    if (caseItem.Headline_media) {
      setSelectedCase(caseItem);
    }
  };

  const handleClose = () => {
    setSelectedCase(null);
  };

  if (isLoading) {
    return (
      <GridContainer>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}>
          Loading...
        </div>
      </GridContainer>
    );
  }

  return (
    <GridContainer>
      <Grid>
        {Array.isArray(cases) && cases.map((item, index) => {
          const format = item.Format;
          const thumbnails = item.Thumbnails;
          const isClickable = !!item.Headline_media;
          
          return (
            <Case 
              key={item.id} 
              format={format}
              index={index}
              className="grid-item"
              onClick={() => handleCaseClick(item)}
              isClickable={isClickable}
            >
              {thumbnails && thumbnails.length > 0 && (
                <>
                  <Thumbnail 
                    src={thumbnails[0].url}
                    alt={item.Title || ''}
                    loading={index >= PRELOAD_COUNT ? "lazy" : "eager"}
                  />
                  {isClickable && <ThumbnailOverlay className="thumbnail-overlay" />}
                </>
              )}
            </Case>
          );
        })}
      </Grid>

      <LightBox 
        isOpen={selectedCase !== null}
        onClose={handleClose}
        title={selectedCase?.Title}
      >
        {selectedCase && (
          <div className="case-content">
            {/* Your case content here */}
          </div>
        )}
      </LightBox>
    </GridContainer>
  );
}

export default PortfolioGrid;