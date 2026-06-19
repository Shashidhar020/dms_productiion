import hierarchyService from "../../modules/context/hierarchy.service.js";

async function hierarchyResolverMiddleware(
  req,
  res,
  next
) {
  try {
    const accessibleDistributorIds =
      await hierarchyService.resolveAccessibleDistributors(
        req.auth
      );

    req.scope = {
      manufacturerId: req.auth.manufacturerId,
      accessibleDistributorIds,
      distributorId:req.auth.distributorId,
      userType:req.auth.userType
    };

    next();
  } catch (error) {
    next(error);
  }
}

export default hierarchyResolverMiddleware;