import fs from 'fs';
import path from 'path';

import {
  db,
  initializeDatabase,
} from './database';

interface HospitalSeed {
  id: string;
  name: string;
  address: string;

  location?: string;

  distanceKm?: number;
  etaMinutes?: number;

  icuBedsAvailable?: number;
  ventilatorsAvailable?: number;

  emergencyTraumaLevel?: string;
  contactNumber?: string;

  coords: {
    lat: number;
    lng: number;
  };
}

function seedDatabase(): void {
  initializeDatabase();

  const seedPath = path.join(
    process.cwd(),
    'backend',
    'data',
    'hospitals.json'
  );

  if (!fs.existsSync(seedPath)) {
    throw new Error(
      `Hospital seed file not found: ${seedPath}`
    );
  }

  const hospitals =
    JSON.parse(
      fs.readFileSync(seedPath, 'utf-8')
    ) as HospitalSeed[];

  const insertHospital = db.prepare(`
    INSERT OR IGNORE INTO hospitals (
      id,
      name,
      address,
      location,
      distance_km,
      eta_minutes,
      emergency_trauma_level,
      contact_number,
      latitude,
      longitude
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertResource = db.prepare(`
    INSERT OR IGNORE INTO hospital_resources (
      hospital_id,
      resource_type,
      total,
      available,
      occupied,
      maintenance,
      minimum_threshold
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const transaction = db.transaction(
    (rows: HospitalSeed[]) => {
      for (const hospital of rows) {
        insertHospital.run(
          hospital.id,
          hospital.name,
          hospital.address,
          hospital.location ?? null,
          hospital.distanceKm ?? 0,
          hospital.etaMinutes ?? 0,
          hospital.emergencyTraumaLevel ?? null,
          hospital.contactNumber ?? null,
          hospital.coords.lat,
          hospital.coords.lng
        );

        const icu =
          hospital.icuBedsAvailable ?? 0;

        const ventilators =
          hospital.ventilatorsAvailable ?? 0;

        insertResource.run(
          hospital.id,
          'icu_beds',
          icu,
          icu,
          0,
          0,
          Math.max(
            1,
            Math.floor(icu * 0.2)
          )
        );

        insertResource.run(
          hospital.id,
          'ventilators',
          ventilators,
          ventilators,
          0,
          0,
          Math.max(
            1,
            Math.floor(ventilators * 0.2)
          )
        );
      }
    }
  );

  transaction(hospitals);

  console.log(
    `Database seed complete: ${hospitals.length} hospitals`
  );

  db.close();
}

seedDatabase();