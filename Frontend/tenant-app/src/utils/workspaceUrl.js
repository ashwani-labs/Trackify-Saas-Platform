export function getTenantWorkspaceBaseUrl(tenantDomain) {
  if (typeof window !== 'undefined' && tenantDomain) {
    const { protocol, hostname, port } = window.location;
    const portSuffix = port ? `:${port}` : '';

    if (hostname === tenantDomain || hostname.startsWith(`${tenantDomain}.`)) {
      return `${protocol}//${hostname}${portSuffix}`;
    }
  }

  const port = import.meta.env.VITE_TENANT_APP_PORT || '5174';
  return `http://${tenantDomain}.trackify.com:${port}`;
}

export function getTenantRegisterUrl(tenantDomain) {
  return `${getTenantWorkspaceBaseUrl(tenantDomain)}/register`;
}

export async function copyToClipboard(text) {
  if (!text) return false;

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to legacy copy.
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand('copy');
    document.body.removeChild(textarea);
    return copied;
  } catch {
    return false;
  }
}
