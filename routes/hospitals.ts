import { Router, Request, Response } from 'express';
import { db } from '../backend/db/database';
import { Hospital } from '../src/types';

export const hospitalsRouter = Router();

export const DATASET_DISCLAIMER =
  'Demo/Mock Data — for SIH Prototype';

type HospitalWithLocation = Hospital & {
  location?: string;
};

function mapHospital(row: any): HospitalWithLocation {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    location: row.location ?? undefined,

    distanceKm: row.distance_km ?? 0,
    etaMinutes: row.eta_minutes ?? 0,

    icuBedsAvailable: row.icu_beds_available ?? 0,
    ventilatorsAvailable: row.ventilators_available ?? 0,

    emergencyTraumaLevel:
      row.emergency_trauma_level ?? '',

    contactNumber:
      row.contact_number ?? '',

    coords: {
      lat: row.latitude,
      lng: row.longitude,
    },
  };
}

/**
 * GET /api/hospitals
 *
 * Query parameters:
 *   location - searches name, address and location
 *   search/q - general text search
 */
hospitalsRouter.get(
  '/',
  (req: Request, res: Response) => {
    try {
      const rawLocation = req.query.location;
      const rawSearch = req.query.search || req.query.q;

      /*
       * LOCATION SEARCH
       */
      if (rawLocation !== undefined) {
        if (
          typeof rawLocation !== 'string' ||
          rawLocation.trim() === ''
        ) {
          return res.status(400).json({
            success: false,
            error: 'Invalid request',
            message:
              'Location query parameter cannot be empty',
          });
        }

        const query = `
          SELECT
            h.*,

            COALESCE(
              (
                SELECT available
                FROM hospital_resources hr
                WHERE hr.hospital_id = h.id
                  AND hr.resource_type = 'icu_beds'
              ),
              0
            ) AS icu_beds_available,

            COALESCE(
              (
                SELECT available
                FROM hospital_resources hr
                WHERE hr.hospital_id = h.id
                  AND hr.resource_type = 'ventilators'
              ),
              0
            ) AS ventilators_available

          FROM hospitals h

          WHERE LOWER(h.name) LIKE ?
             OR LOWER(h.address) LIKE ?
             OR LOWER(COALESCE(h.location, '')) LIKE ?
        `;

        const pattern =
          `%${rawLocation.trim().toLowerCase()}%`;

        const rows = db.prepare(query).all(
          pattern,
          pattern,
          pattern
        );

        const hospitals = rows.map(mapHospital);

        if (hospitals.length === 0) {
          return res.status(404).json({
            success: false,
            error: 'Location not found',
            message: `No hospitals found for location: ${rawLocation}`,
            data: [],
          });
        }

        return res.status(200).json({
          success: true,
          count: hospitals.length,
          disclaimer: DATASET_DISCLAIMER,
          location: rawLocation,
          data: hospitals,
        });
      }

      /*
       * GENERAL SEARCH
       */
      if (rawSearch !== undefined) {
        if (
          typeof rawSearch !== 'string' ||
          rawSearch.trim() === ''
        ) {
          return res.status(400).json({
            success: false,
            error: 'Invalid request',
            message:
              'Search query parameter cannot be empty',
          });
        }

        const query = `
          SELECT
            h.*,

            COALESCE(
              (
                SELECT available
                FROM hospital_resources hr
                WHERE hr.hospital_id = h.id
                  AND hr.resource_type = 'icu_beds'
              ),
              0
            ) AS icu_beds_available,

            COALESCE(
              (
                SELECT available
                FROM hospital_resources hr
                WHERE hr.hospital_id = h.id
                  AND hr.resource_type = 'ventilators'
              ),
              0
            ) AS ventilators_available

          FROM hospitals h

          WHERE LOWER(h.name) LIKE ?
             OR LOWER(h.address) LIKE ?
             OR LOWER(COALESCE(h.location, '')) LIKE ?
             OR LOWER(COALESCE(h.emergency_trauma_level, '')) LIKE ?
        `;

        const pattern =
          `%${rawSearch.trim().toLowerCase()}%`;

        const rows = db.prepare(query).all(
          pattern,
          pattern,
          pattern,
          pattern
        );

        const hospitals = rows.map(mapHospital);

        if (hospitals.length === 0) {
          return res.status(404).json({
            success: false,
            error: 'Hospital not found',
            message:
              `No hospitals found matching search query: ${rawSearch}`,
            data: [],
          });
        }

        return res.status(200).json({
          success: true,
          count: hospitals.length,
          disclaimer: DATASET_DISCLAIMER,
          searchQuery: rawSearch,
          data: hospitals,
        });
      }

      /*
       * RETURN ALL HOSPITALS
       */
      const query = `
        SELECT
          h.*,

          COALESCE(
            (
              SELECT available
              FROM hospital_resources hr
              WHERE hr.hospital_id = h.id
                AND hr.resource_type = 'icu_beds'
            ),
            0
          ) AS icu_beds_available,

          COALESCE(
            (
              SELECT available
              FROM hospital_resources hr
              WHERE hr.hospital_id = h.id
                AND hr.resource_type = 'ventilators'
            ),
            0
          ) AS ventilators_available

        FROM hospitals h
        ORDER BY h.name ASC
      `;

      const rows = db.prepare(query).all();

      const hospitals = rows.map(mapHospital);

      return res.status(200).json({
        success: true,
        count: hospitals.length,
        disclaimer: DATASET_DISCLAIMER,
        data: hospitals,
      });
    } catch (error: any) {
      console.error(
        'Error handling /api/hospitals request:',
        error
      );

      return res.status(500).json({
        success: false,
        error: 'Server error',
        message:
          error.message ||
          'An unexpected error occurred while retrieving hospitals',
      });
    }
  }
);

/**
 * GET /api/hospitals/:id
 */
hospitalsRouter.get(
  '/:id',
  (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id || id.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'Invalid request',
          message:
            'Hospital ID parameter is required',
        });
      }

      const query = `
        SELECT
          h.*,

          COALESCE(
            (
              SELECT available
              FROM hospital_resources hr
              WHERE hr.hospital_id = h.id
                AND hr.resource_type = 'icu_beds'
            ),
            0
          ) AS icu_beds_available,

          COALESCE(
            (
              SELECT available
              FROM hospital_resources hr
              WHERE hr.hospital_id = h.id
                AND hr.resource_type = 'ventilators'
            ),
            0
          ) AS ventilators_available

        FROM hospitals h
        WHERE LOWER(h.id) = LOWER(?)
      `;

      const hospital = db
        .prepare(query)
        .get(id.trim());

      if (!hospital) {
        return res.status(404).json({
          success: false,
          error: 'Hospital not found',
          message:
            `No hospital found with ID: ${id}`,
        });
      }

      return res.status(200).json({
        success: true,
        disclaimer: DATASET_DISCLAIMER,
        data: mapHospital(hospital),
      });
    } catch (error: any) {
      console.error(
        `Error handling /api/hospitals/${req.params.id} request:`,
        error
      );

      return res.status(500).json({
        success: false,
        error: 'Server error',
        message:
          error.message ||
          'An unexpected error occurred while retrieving hospital details',
      });
    }
  }
);