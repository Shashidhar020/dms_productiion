import { db } from "../../config/database.js";

export const getUserData = async (auth) => {
    let companyData = null;

    if (auth.userType === "MANUFACTURER") {
        const cq = `
            SELECT 
                mfg.company_name,
                mfg.gst_number,
                mfg.email AS company_email,
                mfg.pan_number,
                mfg.mobile,
                mfg.address
            FROM manufacturers mfg
            WHERE mfg.id = ?
        `;

        const [rows] = await db.execute(cq, [auth.manufacturerId]);
        console.log(rows)
        companyData = rows[0] || null;
    }

    // Distributor
    if (auth.userType === "DISTRIBUTOR") {
        const cq = `
            SELECT 
                db.business_name AS company_name,
                db.gst_number,
                db.email AS company_email,
                db.pan_number,
                db.mobile,
                db.address
            FROM distributors db
            WHERE db.id = ?
        `;

        const [rows] = await db.execute(cq, [auth.distributorId]);
        companyData = rows[0] || null;
    }

    // User Data
    const uq = `
        SELECT 
            CONCAT(u.first_name, ' ', u.last_name) AS name,
            u.user_type,
            u.email,
            u.mobile,
            ak.key_hash as api_key
        FROM users u
        LEFT JOIN api_keys ak ON u.id = ak.user_id
        WHERE u.id = ?
    `;

    const [userRows] = await db.execute(uq, [auth.userId]);

    const userData = userRows[0] || null;

    return {
        user: userData,
        company: companyData
    };
};

