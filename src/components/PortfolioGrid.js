import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import '../styles/components/PortfolioGrid.scss';

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

function PortfolioGrid() {
  const [cases, setCases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const PRELOAD_COUNT = 5; // Number of images to preload

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
        console.log('Fetching from:', url); // Debug log
        
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${process.env.REACT_APP_STRAPI_API_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          // Log the actual error response
          const errorText = await response.text();
          console.error('API Error Response:', errorText);
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
          
          return (
            <Case 
              key={item.id} 
              format={format}
              index={index}
              className="grid-item"
            >
              {thumbnails && thumbnails.length > 0 && (
                <Thumbnail 
                  src={`${process.env.REACT_APP_API_URL}${thumbnails[0].url}`}
                  alt={item.Title || ''}
                  loading={index >= PRELOAD_COUNT ? "lazy" : "eager"}
                />
              )}
            </Case>
          );
        })}
      </Grid>
    </GridContainer>
  );
}

export default PortfolioGrid;