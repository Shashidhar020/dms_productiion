import stockModel from './stockItem.model.js'
import { db } from '../../config/database.js';
import { insertChildTables, refreshGST, refreshHSN, getStockIdMapByGuid, deleteChildData, bulkUpsertStockItemsMaster } from './stockItem.model.js';
import { chunkArray } from '../../utils/batcher.js';
const getStockItems = async (scope) => {
  const data = await stockModel.getStockItems(scope)
  return {
    count: data?.products?.length,
    data
  };
};

export const processStockBulk = async (items,auth) => {
  const conn = await db.getConnection();
  let total = 0;
  let stockItems = []
  try {
    await conn.beginTransaction();
    const batches = chunkArray(items, 1000);
    for (const batch of batches) {
      // 1. UPSERT MASTER ONLY
      // await bulkUpsertStock(conn, batch);
      await bulkUpsertStockItemsMaster(conn, batch,auth);
      batch.map((b) => stockItems.push({stockname:b.name}))
  
      // 2. GET IDS
      const idMap = await getStockIdMapByGuid(conn, batch,auth);
      const stockIds = [...idMap.values()];
      // 3. DELETE ALL CHILDREN FIRST (IMPORTANT FIX)
      await deleteChildData(conn, stockIds);
      // 4. INSERT CHILDREN (NO UPSERT)
      await insertChildTables(conn, idMap, batch);
      await refreshGST(conn, idMap, batch);
      await refreshHSN(conn, idMap, batch);
      total += batch.length;
    }
    await conn.commit();
    return { success: true, total, stockItems };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

export default { getStockItems }