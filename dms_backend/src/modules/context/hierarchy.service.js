import hierarchyRepository from "./hierarchy.repository.js";

class HierarchyService {
  async resolveAccessibleDistributors(auth) {
    const {
      manufacturerId,
      distributorId,
      userType,
    } = auth;

    // Manufacturer users
    if (userType === "MANUFACTURER") {
      const distributors =
        await hierarchyRepository.getAllManufacturerDistributors(
          manufacturerId
        );

      return distributors.map((d) => d.id);
    }

    // Distributor users
    if (!distributorId) {
      return [];
    }

    const accessibleDistributorIds = [];

    await this.collectChildDistributors(
      manufacturerId,
      distributorId,
      accessibleDistributorIds
    );

    return accessibleDistributorIds;
  }

  async collectChildDistributors(
    manufacturerId,
    distributorId,
    result
  ) {
    result.push(distributorId);

    const children =
      await hierarchyRepository.getChildDistributors(
        manufacturerId,
        distributorId
      );

    for (const child of children) {
      await this.collectChildDistributors(
        manufacturerId,
        child.id,
        result
      );
    }
  }
}

export default new HierarchyService();