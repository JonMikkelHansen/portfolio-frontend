import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import '../styles/components/PortfolioGrid.scss';
import LightBox from './LightBox';
import { Case } from '../types/case';

declare global {
  interface Window {
    cloudinary: {
      videoPlayer: (element: HTMLElement, options: any) => any;
    };
  }
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
  grid-template-columns: repeat(2, 1fr);
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(5, 1fr);
  }
`;

const CaseItem = styled.div<{ format: string; index: number; isClickable: boolean }>`
  position: relative;
  background: #2a2a2a;
  grid-column: ${props => props.format === 'Wide' ? '1 / -1' : 'span 1'};
  opacity: 0;
  animation: fadeIn 0.5s ease-in forwards;
  animation-delay: ${props => props.index * 0.1}s;
  
  ${props => props.isClickable && `
    cursor: pointer;
    
    &:hover {
      .case-overlay {
        opacity: 1;
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
`;

const Thumbnail = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

const CaseOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  opacity: 0;
  transition: opacity 0.3s ease;
  padding: 2rem;
  color: white;
`;

const CaseTitle = styled.h3`
  font-size: 1.125rem;
  margin: 0 0 0.5rem 0;
  font-weight: 500;
  text-align: left;
  position: absolute;
  bottom: 3.5rem;
  left: 2rem;
`;

const CaseDescription = styled.p`
  font-size: 0.875rem;
  margin: 0;
  line-height: 1.4;
  text-align: left;
  position: absolute;
  bottom: 2rem;
  left: 2rem;
  max-width: 80%;
`;

const VideoContainer = styled.div`
  width: 100%;
  position: relative;
  padding-top: 56.25%;
  margin: 0;

  @media (max-width: 768px) {
    width: calc(100% - 16px);
    margin: 0 8px;
  }
`;

const VideoCaption = styled.p`
  font-size: 12px;
  font-style: italic;
  color: #FFFFFF;
  margin: 8px 0 0;
  opacity: 0.8;
  
  @media (max-width: 768px) {
    margin: 4px 8px 0;
  }
`;

const TextContent = styled.div`
  flex: 1;
  width: 50%;

  h2 {
    font-size: 24px;
    margin: 0 0 20px 0;
    color: #FFFFFF;
  }

  p {
    font-size: 16px;
    line-height: 1.6;
    color: #FFFFFF;
    margin-bottom: 16px;
  }

  @media (max-width: 768px) {
    width: 100%;
    padding: 0 16px;
    
    h2 {
      font-size: 20px;
      margin: 16px 0;
    }

    p {
      font-size: 14px;
      line-height: 1.5;
    }
  }
`;

const CompanyContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  position: absolute;
  top: 20px;
  right: 20px;
`;

const CompanyText = styled.span`
  font-size: 14px;
  color: white;
`;

const LightboxContent = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 2rem 2rem;

  @media (max-width: 768px) {
    padding: 1rem 0 0;  // Top padding for header
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  gap: 40px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0;
  }
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  width: 50%;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const VideoWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const renderRichText = (content: any) => {
  if (!Array.isArray(content)) return null;
  
  return content.map((block, index) => {
    if (block.type === 'paragraph' && block.children) {
      return (
        <p key={index}>
          {block.children.map((child: any, childIndex: number) => (
            <span key={childIndex}>{child.text}</span>
          ))}
        </p>
      );
    }
    return null;
  });
};

const getImageUrl = (url: string) => {
  if (url.startsWith('http')) {
    return url;  // Already a full URL (Cloudinary)
  }
  return `${process.env.REACT_APP_API_URL}${url}`; // Local URL
};

function PortfolioGrid() {
  const [cases, setCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const PRELOAD_COUNT = 5;
  const videoRef = useRef<HTMLVideoElement>(null);

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
        const url = `${process.env.REACT_APP_API_URL}/api/portfolio?populate[cases][populate][0]=Thumbnails&populate[cases][populate][1]=Company.Logo&populate[cases][populate][2]=Headline_media`;
        
        const response = await fetch(url);
        const result = await response.json();
        
        console.log('=== PORTFOLIO DEBUG ===');
        console.log('Full response:', result);
        
        // The cases are directly in result.data.cases
        if (result.data?.cases && Array.isArray(result.data.cases)) {
          console.log('Setting cases:', result.data.cases);
          setCases(result.data.cases);
        }
      } catch (error) {
        console.error('Error fetching portfolio:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCases();
  }, []);

  useEffect(() => {
    if (selectedCase?.Headline_media && videoRef.current) {
      const cloudName = process.env.REACT_APP_CLOUDINARY_NAME;
      if (!cloudName) {
        console.error('Cloudinary cloud name not found');
        return;
      }

      const player = window.cloudinary.videoPlayer(videoRef.current, {
        cloud_name: cloudName,
        controls: true,
        fluid: true,
        loop: true,
        playsinline: true,
        muted: false,
        showLogo: false,
        transformation: {
          width: 1920,
          crop: "fill"
        },
        buttonBehavior: {
          fullscreen: 'always'
        }
      });
      
      const source = {
        publicId: selectedCase.Headline_media?.provider_metadata?.public_id || selectedCase.Headline_media,
      };
      
      player.source(source);
    }
  }, [selectedCase]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <GridContainer>
      <Grid>
        {Array.isArray(cases) && cases.map((item, index) => {
          const isClickable = isInteractive(item);
          const thumbnailUrl = item.Thumbnails?.[0]?.url;
          console.log('Thumbnail data:', item.Thumbnails?.[0]);
          
          return (
            <CaseItem 
              key={item.id} 
              format={item.Format}
              index={index}
              isClickable={isClickable}
              onClick={() => isClickable && handleCaseClick(item)}
            >
              {thumbnailUrl && (
                <>
                  <Thumbnail 
                    src={getImageUrl(thumbnailUrl)}
                    alt={item.Title || ''}
                    loading={index >= PRELOAD_COUNT ? "lazy" : "eager"}
                    onError={(e) => {
                      console.error('Image failed to load:', e);
                      console.log('Image URL:', getImageUrl(thumbnailUrl));
                    }}
                  />
                  {isClickable && (
                    <CaseOverlay className="case-overlay">
                      {item.Company && (
                        <CompanyContainer>
                          <CompanyText>{item.Company.Name}</CompanyText>
                          {item.Company.Logo?.[0]?.url && (
                            <img 
                              src={getImageUrl(item.Company.Logo[0].url)}
                              alt={item.Company.Name}
                              style={{ width: '24px', height: '24px', objectFit: 'contain' }}
                            />
                          )}
                        </CompanyContainer>
                      )}
                      <CaseTitle>{item.Title}</CaseTitle>
                      {item.Short_description?.[0]?.children?.[0]?.text && (
                        <CaseDescription>
                          {item.Short_description[0].children[0].text}
                        </CaseDescription>
                      )}
                    </CaseOverlay>
                  )}
                </>
              )}
            </CaseItem>
          );
        })}
      </Grid>

      <LightBox 
        isOpen={selectedCase !== null}
        onClose={handleClose}
        title={null}
        companyName={selectedCase?.Company?.Name}
        companyLogo={selectedCase?.Company?.Logo?.[0]?.url ? getImageUrl(selectedCase.Company.Logo[0].url) : undefined}
      >
        {selectedCase && (
          <LightboxContent>
            <ContentWrapper>
              <LeftColumn>
                {selectedCase.Headline_media && (
                  <VideoWrapper>
                    <VideoContainer>
                      <video
                        ref={videoRef}
                        className="cld-video-player"
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%'
                        }}
                      />
                    </VideoContainer>
                    {selectedCase.Headline_media.caption && (
                      <VideoCaption>{selectedCase.Headline_media.caption}</VideoCaption>
                    )}
                  </VideoWrapper>
                )}
              </LeftColumn>
              <TextContent>
                <h2>{selectedCase.Title}</h2>
                {renderRichText(selectedCase.Description)}
              </TextContent>
            </ContentWrapper>
          </LightboxContent>
        )}
      </LightBox>
    </GridContainer>
  );
}

export default PortfolioGrid;


