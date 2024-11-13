import { ReactNode } from 'react';
import styled from 'styled-components';
import '../styles/components/_lightbox.scss';

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 1.5rem 2rem;
  background: rgba(0, 0, 0, 0.95);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1001;
  backdrop-filter: blur(5px);

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const CompanyInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const CompanyLogo = styled.img`
  width: 32px;
  height: 32px;
  object-fit: contain;
`;

const CompanyName = styled.span`
  font-size: 1.125rem;
  color: #FFFFFF;
  font-weight: 400;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #FFFFFF;
  font-size: 32px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  opacity: 0.8;
  transition: opacity 0.2s ease;
  
  &:hover {
    opacity: 1;
  }
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 80px 32px 32px;
`;

interface LightBoxProps {
  isOpen: boolean;
  onClose: () => void;
  title: string | null | undefined;
  companyName?: string;
  companyLogo?: string;
  children: ReactNode;
}

function LightBox({ isOpen, onClose, companyName, companyLogo, children }: LightBoxProps) {
  if (!isOpen) return null;

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <div 
        className="lightbox-content" 
        onClick={e => e.stopPropagation()}
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        <Header>
          <CompanyInfo>
            {companyLogo && (
              <CompanyLogo 
                src={companyLogo}
                alt={companyName || ''}
              />
            )}
            {companyName && <CompanyName>{companyName}</CompanyName>}
          </CompanyInfo>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </Header>
        <Content>
          {children}
        </Content>
      </div>
    </div>
  );
}

export default LightBox;
