import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { applyTenantTheme, DEFAULT_TENANT_THEME } from '@trackify/shared';

const TenantBrandingEffect = () => {
  const brandTheme = useSelector((state) => state.auth.brandTheme);

  useEffect(() => {
    applyTenantTheme(brandTheme || DEFAULT_TENANT_THEME);
  }, [brandTheme]);

  return null;
};

export default TenantBrandingEffect;
