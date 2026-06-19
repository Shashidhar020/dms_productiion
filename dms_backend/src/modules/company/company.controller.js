import { z } from 'zod';
import { AppError } from '../../shared/app-error.js';
import {
  createDistributorCompany,
  createManufacturerCompany,
  getCompanyById,
  mapDistributorToManufacturer
} from './company.service.js';

const createCompanySchema = z.object({
  company_code: z.string().trim().min(3).max(50),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email()
});

const mapDistributorSchema = z.object({
  manufacturer_company_id: z.coerce.number().int().positive(),
  distributor_company_id: z.coerce.number().int().positive()
});

function parseSchema(schema, payload) {
  const result = schema.safeParse(payload);
  if (!result.success) {
    const message = result.error.issues[0]?.message || 'Validation failed';
    throw new AppError(message, 400);
  }
  return result.data;
}

export async function getCompany(request, response) {
  const company = await getCompanyById(request.user.company_id);
  return response.status(200).json({
    success: true,
    data: company
  });
}

export async function createManufacturer(request, response) {
  const payload = parseSchema(createCompanySchema, request.body);
  const company = await createManufacturerCompany({
    companyCode: payload.company_code,
    name: payload.name,
    email: payload.email
  });

  return response.status(201).json({
    success: true,
    message: 'Manufacturer created successfully',
    data: company
  });
}


export async function createDistributor(request, response) {
  const payload = parseSchema(createCompanySchema, request.body);
  const company = await createDistributorCompany({
    companyCode: payload.company_code,
    name: payload.name,
    email: payload.email
  });

  return response.status(201).json({
    success: true,
    message: 'Distributor created successfully',
    data: company
  });
}

export async function mapDistributor(request, response) {
  const payload = parseSchema(mapDistributorSchema, request.body);
  const mapping = await mapDistributorToManufacturer({
    manufacturerCompanyId: payload.manufacturer_company_id,
    distributorCompanyId: payload.distributor_company_id
  });

  return response.status(201).json({
    success: true,
    message: 'Distributor mapped to manufacturer successfully',
    data: mapping
  });
}
