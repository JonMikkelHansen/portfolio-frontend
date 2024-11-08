import { ReactNode } from 'react';
import styled from 'styled-components';
import '../styles/components/_lightbox.scss';

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 20px 40px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
`;

const CompanyInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const CompanyLogo = styled.img`
  width: 32px;
  height: 32px;
  object-fit: contain;
`;

const CompanyName = styled.span`
  font-size: 16px;
  color: rgba(255, 255, 255, 1);
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 1);
  font-size: 32px;
  cursor: pointer;
  padding: 10px;
  transition: color 0.3s ease;
  
  &:hover {
    color: rgba(255, 255, 255, 0.8);
  }
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
    <div className="lightbox-overlay">
      <div className="lightbox-content" onClick={e => e.stopPropagation()}>
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
          <CloseButton onClick={onClose}>×</CloseButton>
        </Header>
        {children}
      </div>
    </div>
  );
}

export default LightBox;
