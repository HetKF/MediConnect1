import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { Hospital } from '../src/types';

export const hospitalsRouter = Router();

export const DATASET_DISCLAIMER = 'Demo/Mock Data — for SIH Prototype';

// Helper to load hospitals data safely from json file
function loadHospitalsData(): (Hospital & { location?: string })[] {
  try {
    const primaryPath = path.join(process.cwd(), 'data', 'hospitals.json');
    const fallbackPath = path.join(process.cwd(), 'backend', 'data', 'hospitals.json');
    const targetPath = fs.existsSync(primaryPath) ? primaryPath : fallbackPath;
    
    if (fs.existsSync(targetPath)) {
      const raw = fs.readFileSync(targetPath, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error loading hospitals.json:', err);
  }
  return [];
}

/**
 * GET /api/hospitals
 * Query Parameters:
 *  - location: string (case-insensitive search by location/suburb)
 *  - search | q: string (general text search across name, address, trauma level)
 */
hospitalsRouter.get('/', (req: Request, res: Response) => {
  try {
    const allHospitals = loadHospitalsData();

    if (!allHospitals || allHospitals.length === 0) {
      return res.status(500).json({
        success: false,
        error: 'Server error',
        message: 'Hospital database is currently unavailable',
      });
    }

    // 1. Check for location parameter
    if (req.query.location !== undefined) {
      const rawLocation = req.query.location;
      
      if (typeof rawLocation !== 'string' || rawLocation.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'Invalid request',
          message: 'Location query parameter cannot be empty',
        });
      }

      const queryLocation = rawLocation.trim().toLowerCase();

      const matchedHospitals = allHospitals.filter((h) => {
        const locMatch = h.location?.toLowerCase().includes(queryLocation);
        const addrMatch = h.address.toLowerCase().includes(queryLocation);
        const nameMatch = h.name.toLowerCase().includes(queryLocation);
        return locMatch || addrMatch || nameMatch;
      });

      if (matchedHospitals.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Location not found',
          message: `No hospitals found for location: ${rawLocation}`,
          data: [],
        });
      }

      return res.status(200).json({
        success: true,
        count: matchedHospitals.length,
        disclaimer: DATASET_DISCLAIMER,
        location: rawLocation,
        data: matchedHospitals,
      });
    }

    // 2. Check for general search parameter
    const rawSearch = req.query.search || req.query.q;
    if (rawSearch !== undefined) {
      if (typeof rawSearch !== 'string' || rawSearch.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'Invalid request',
          message: 'Search query parameter cannot be empty',
        });
      }

      const querySearch = rawSearch.trim().toLowerCase();
      const matchedHospitals = allHospitals.filter((h) => {
        return (
          h.name.toLowerCase().includes(querySearch) ||
          h.address.toLowerCase().includes(querySearch) ||
          h.emergencyTraumaLevel.toLowerCase().includes(querySearch) ||
          (h.location && h.location.toLowerCase().includes(querySearch))
        );
      });

      if (matchedHospitals.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Hospital not found',
          message: `No hospitals found matching search query: ${rawSearch}`,
          data: [],
        });
      }

      return res.status(200).json({
        success: true,
        count: matchedHospitals.length,
        disclaimer: DATASET_DISCLAIMER,
        searchQuery: rawSearch,
        data: matchedHospitals,
      });
    }

    // 3. Return all hospitals
    return res.status(200).json({
      success: true,
      count: allHospitals.length,
      disclaimer: DATASET_DISCLAIMER,
      data: allHospitals,
    });
  } catch (error: any) {
    console.error('Error handling /api/hospitals request:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message || 'An unexpected error occurred while retrieving hospitals',
    });
  }
});

/**
 * GET /api/hospitals/:id
 * Retrieve complete detailed data for a specific hospital by ID
 */
hospitalsRouter.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || id.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Invalid request',
        message: 'Hospital ID parameter is required',
      });
    }

    const allHospitals = loadHospitalsData();
    const hospital = allHospitals.find(
      (h) => h.id.toLowerCase() === id.trim().toLowerCase()
    );

    if (!hospital) {
      return res.status(404).json({
        success: false,
        error: 'Hospital not found',
        message: `No hospital found with ID: ${id}`,
      });
    }

    return res.status(200).json({
      success: true,
      disclaimer: DATASET_DISCLAIMER,
      data: hospital,
    });
  } catch (error: any) {
    console.error(`Error handling /api/hospitals/${req.params.id} request:`, error);
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message || 'An unexpected error occurred while retrieving hospital details',
    });
  }
});
