/** Mirrors Backend/common-lib Role enum */
export const ROLES = Object.freeze({
  MASTER: 'MASTER',
  ADMIN: 'ADMIN',
  USER: 'USER',
});

export const ADMIN_ROLES = [ROLES.MASTER, ROLES.ADMIN];

export function isAdminRole(role) {
  return role === ROLES.ADMIN || role === ROLES.MASTER;
}
