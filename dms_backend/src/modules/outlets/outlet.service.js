
import outletModel from './outlet.model.js'

const getOutlets = async (scope) => {

  const data = await outletModel.getOutlets(scope)

  return {
    count: data.length,
    data
  };
};

export default {getOutlets}