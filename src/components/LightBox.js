import '../styles/components/_lightbox.scss';

function LightBox({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="lightbox-overlay">
      <div className="lightbox-header">
        {title && <h2 className="lightbox-title">{title}</h2>}
        <button className="lightbox-close" onClick={onClose}>×</button>
      </div>
      <div className="lightbox-content" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export default LightBox;
