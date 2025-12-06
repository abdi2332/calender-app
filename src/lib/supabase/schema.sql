-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    patient_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    appointment_time TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL CHECK (
        status IN (
            'pending',
            'confirmed',
            'cancelled',
            'rescheduled'
        )
    ),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on appointment_time for faster queries
CREATE INDEX IF NOT EXISTS idx_appointments_time ON appointments (appointment_time);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments (status);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO
    appointments (
        patient_name,
        phone_number,
        appointment_time,
        status,
        notes
    )
VALUES (
        'John Smith',
        '+1-555-0101',
        '2025-12-07 09:00:00+03',
        'pending',
        'Annual checkup'
    ),
    (
        'Sarah Johnson',
        '+1-555-0102',
        '2025-12-07 10:30:00+03',
        'confirmed',
        'Follow-up visit'
    ),
    (
        'Michael Brown',
        '+1-555-0103',
        '2025-12-07 14:00:00+03',
        'pending',
        'New patient consultation'
    ),
    (
        'Emily Davis',
        '+1-555-0104',
        '2025-12-08 09:30:00+03',
        'pending',
        'Dental cleaning'
    ),
    (
        'David Wilson',
        '+1-555-0105',
        '2025-12-08 11:00:00+03',
        'confirmed',
        'X-ray appointment'
    ),
    (
        'Lisa Anderson',
        '+1-555-0106',
        '2025-12-09 10:00:00+03',
        'pending',
        'Physical therapy'
    ),
    (
        'James Martinez',
        '+1-555-0107',
        '2025-12-09 13:30:00+03',
        'pending',
        'Blood work'
    ),
    (
        'Jennifer Taylor',
        '+1-555-0108',
        '2025-12-10 09:00:00+03',
        'confirmed',
        'Cardiology consultation'
    ),
    (
        'Robert Thomas',
        '+1-555-0109',
        '2025-12-10 15:00:00+03',
        'pending',
        'Dermatology appointment'
    ),
    (
        'Mary Garcia',
        '+1-555-0110',
        '2025-12-11 10:30:00+03',
        'pending',
        'Vaccination'
    ),
    (
        'William Rodriguez',
        '+1-555-0111',
        '2025-12-11 14:00:00+03',
        'confirmed',
        'Eye examination'
    ),
    (
        'Patricia Martinez',
        '+1-555-0112',
        '2025-12-12 09:30:00+03',
        'pending',
        'Allergy testing'
    ),
    (
        'Christopher Lee',
        '+1-555-0113',
        '2025-12-12 11:30:00+03',
        'pending',
        'Orthopedic consultation'
    ),
    (
        'Barbara White',
        '+1-555-0114',
        '2025-12-13 10:00:00+03',
        'confirmed',
        'Nutrition counseling'
    ),
    (
        'Daniel Harris',
        '+1-555-0115',
        '2025-12-13 14:30:00+03',
        'pending',
        'Mental health session'
    );