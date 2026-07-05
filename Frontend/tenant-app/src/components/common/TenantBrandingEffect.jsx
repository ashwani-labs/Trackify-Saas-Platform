import { useEffect } from 'react';
import { useSelector } from 'react-redux';

const TenantBrandingEffect = () => {
  const primaryColor = useSelector((state) => state.auth.primaryColor);

  useEffect(() => {
    if (primaryColor) {
      document.documentElement.style.setProperty('--primary', primaryColor);
      document.documentElement.style.setProperty('--brand-primary', primaryColor);
    }
  }, [primaryColor]);

  return null;
};

export default TenantBrandingEffect;
