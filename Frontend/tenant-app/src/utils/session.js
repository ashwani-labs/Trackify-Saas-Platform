const TENANT_STORAGE_KEYS = [
  'tenantToken',
  'tenantId',
  'tenantDomain',
  'tenantLogo',
  'tenantColor',
  'tenantUserEmail',
  'tenantUserRole',
  'tenantUserProfilePhoto',
];

export function clearTenantSession() {
  TENANT_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
}
