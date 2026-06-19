import { db } from '../config/database.js';

export async function findCompanyById(companyId) {
  const [rows] = await db.execute(
    `
      SELECT id, company_code, name, email, company_type, created_at, updated_at
      FROM companies
      WHERE id = ?
      LIMIT 1
    `,
    [companyId]
  );

  return rows[0] || null;
}

export async function findCompanyByCode(companyCode) {
  const [rows] = await db.execute(
    `
      SELECT id, company_code, name, email, company_type
      FROM companies
      WHERE company_code = ?
      LIMIT 1
    `,
    [companyCode]
  );

  return rows[0] || null;
}

export async function findCompanyByEmail(email) {
  const [rows] = await db.execute(
    `
      SELECT id, company_code, name, email, company_type
      FROM companies
      WHERE email = ?
      LIMIT 1
    `,
    [email]
  );

  return rows[0] || null;
}

export async function createCompany({ companyCode, name, email, companyType }) {
  const [result] = await db.execute(
    `
      INSERT INTO companies (company_code, name, email, company_type)
      VALUES (?, ?, ?, ?)
    `,
    [companyCode, name, email, companyType]
  );

  return findCompanyById(result.insertId);
}
