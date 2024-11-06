import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import '../styles/components/PortfolioGrid.scss';
import LightBox from './LightBox';
import { Case } from '../types/case';

// Define prop types for styled components
interface CaseItemProps {
  format: 'Square' | 'Wide';
  index: number;
  isClickable: boolean;
}

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

const CaseItem = styled.div<{ format: string; index: number; isClickable: boolean }>`
  position: relative;
  cursor: ${props => props.isClickable ? 'pointer' : 'default'};
  aspect-ratio: ${props => props.format === 'Wide' ? '2/1' : '1/1'};
  grid-column: ${props => props.format === 'Wide' ? 'span 2' : 'span 1'};
  
  &:hover .thumbnail-overlay {
    opacity: ${props => props.isClickable ? 1 : 0};
  }
`;

const Thumbnail = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ThumbnailOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  opacity: 0;
  transition: opacity 0.3s ease;
  padding: 12px;
`;

const CompanyLogo = styled.img`
  width: 20px;
  height: 20px;
  object-fit: contain;
  margin-left: 4px;
`;

const CompanyText = styled.span`
  color: white;
  font-size: 0.75rem;
  font-weight: 500;
  margin-right: auto;
  letter-spacing: 0.02em;
`;

const CompanyContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

// Add this styled component for the description
const CaseDescription = styled.div`
  color: white;
  margin-top: 20px;
  font-size: 1rem;
  line-height: 1.5;
  white-space: pre-wrap;  // This preserves line breaks
`;

// First, let's update the type definitions
interface CompanyLogo {
  url: string;
  // ... other fields
}

interface Company {
  id: number;
  Name: string;
  Logo?: CompanyLogo[];
  // ... other fields
}

// Update the helper functions
const hasCompanyLogo = (company: any) => {
  if (!company) return false;
  
  console.log('Checking logo for company:', company);  // Debug log
  
  return company?.Logo && 
         Array.isArray(company.Logo) && 
         company.Logo.length > 0 && 
         company.Logo[0]?.url;
};

const getCompanyName = (company: any) => {
  if (company?.Name) {
    return company.Name;
  }
  return 'No Company';
};

function PortfolioGrid() {
  const [cases, setCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const PRELOAD_COUNT = 5;

  const isInteractive = (caseItem: Case) => {
    return !!(caseItem.Headline_media || (caseItem.Description && caseItem.Description.length > 0));
  };

  const handleCaseClick = (caseItem: Case) => {
    if (isInteractive(caseItem)) {
      setSelectedCase(caseItem);
    }
  };

  const handleClose = () => {
    setSelectedCase(null);
  };

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const url = `${process.env.REACT_APP_API_URL}/api/cases?populate[Thumbnails][fields]=url&populate[Headline_media][fields]=*&populate[Company][populate][Logo][fields]=url&populate[Company][fields]=*`;
        
        const response = await fetch(url);
        const result = await response.json();
        
        console.log('=== FULL API RESPONSE ===');
        console.log(JSON.stringify(result, null, 2));
        console.log('=== COMPANY WITH LOGO ===');
        console.log(JSON.stringify(result.data?.[0]?.Company, null, 2));
        
        if (result.data) {
          setCases(result.data);
        }
      } catch (error) {
        console.error('Error fetching cases:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCases();
  }, []);

  if (isLoading) return <div>Loading...</div>;

  return (
    <GridContainer>
      <Grid>
        {cases.map((item, index) => (
          <CaseItem 
            key={item.id} 
            format={item.Format}
            index={index}
            className="grid-item"
            onClick={() => handleCaseClick(item)}
            isClickable={isInteractive(item)}
          >
            {item.Thumbnails?.[0] && (
              <>
                <Thumbnail 
                  src={item.Thumbnails[0].url}
                  alt={item.Title || ''}
                  loading={index >= PRELOAD_COUNT ? "lazy" : "eager"}
                />
                {isInteractive(item) && (
                  <ThumbnailOverlay className="thumbnail-overlay">
                    <CompanyContainer>
                      <CompanyText>
                        {getCompanyName(item.Company)}
                      </CompanyText>
                      {hasCompanyLogo(item.Company) && (
                        <CompanyLogo 
                          src={item.Company?.Logo?.[0]?.url || ''} 
                          alt={getCompanyName(item.Company)}
                        />
                      )}
                    </CompanyContainer>
                  </ThumbnailOverlay>
                )}
              </>
            )}
          </CaseItem>
        ))}
      </Grid>

      <LightBox 
        isOpen={selectedCase !== null}
        onClose={handleClose}
        title={selectedCase?.Title}
      >
        {selectedCase && (
          <div className="case-content">
            {selectedCase.Description?.map((block, index) => (
              <CaseDescription key={index}>
                {block.children?.map((child: any, childIndex: number) => (
                  <p key={childIndex}>{child.text}</p>
                ))}
              </CaseDescription>
            ))}
          </div>
        )}
      </LightBox>
    </GridContainer>
  );
}

export default PortfolioGrid;


