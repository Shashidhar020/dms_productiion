function buildDistributorScope(scope, alias = "") {
  const prefix = alias ? `${alias}.` : "";

  return {
    clause: `
      ${prefix}manufacturer_id = ?
      AND ${prefix}distributor_id IN (?)
    `,
    values: [
      scope.manufacturerId,
      scope.accessibleDistributorIds,
    ],
  };
}

export default{
  buildDistributorScope,
};