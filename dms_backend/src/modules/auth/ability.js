import { AbilityBuilder, createMongoAbility } from '@casl/ability';

export const ROLE = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  MANUFACTURER_ADMIN: 'MANUFACTURER_ADMIN',
  DISTRIBUTOR_ADMIN: 'DISTRIBUTOR_ADMIN',
  SALESMAN: 'SALESMAN'
};

export function defineAbilityFor(user) {
  const { can, build } = new AbilityBuilder(createMongoAbility);

  if (!user) {
    return build();
  }

  if (user.role === ROLE.SUPER_ADMIN) {
    can('manage', 'all');
    return build();
  }
  
  can('read', 'Company');

  if (user.role === ROLE.MANUFACTURER_ADMIN) {
    can('create', 'Manufacturer');
    can('create', 'Distributor');
    can('map', 'Company');
    can('read', 'User');
    can(['read', 'create', 'update'], 'Sale');
  }

  if (user.role === ROLE.DISTRIBUTOR_ADMIN) {
    can('read', 'User');
    can(['read', 'create'], 'Sale');
  }

  if (user.role === ROLE.SALESMAN) {
    can(['read', 'create'], 'Sale');
  }

  return build();
}
