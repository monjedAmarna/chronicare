// Test script for doctor assignment functionality
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:4000/api';

async function testDoctorAssignment() {
  try {
    console.log("🧪 Testing doctor assignment functionality...\n");

    // 1. Test getting doctors list
    console.log("1. Testing GET /api/users/doctors");
    const doctorsResponse = await fetch(`${BASE_URL}/users/doctors`);
    const doctors = await doctorsResponse.json();
    console.log("✅ Doctors list:", doctors);
    console.log("");

    if (doctors.length === 0) {
      console.log("❌ No doctors found. Please ensure doctors are seeded in the database.");
      return;
    }

    // 2. Test patient registration with doctor assignment
    console.log("2. Testing patient registration with doctor assignment");
    const testPatient = {
      firstName: "Test",
      lastName: "Patient",
      name: "Test Patient",
      email: "testpatient@example.com",
      password: "password123",
      phone: "1234567890",
      role: "patient",
      doctorId: doctors[0].id
    };

    const registerResponse = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPatient)
    });

    if (registerResponse.ok) {
      const registrationResult = await registerResponse.json();
      console.log("✅ Patient registration successful");
      console.log("   User ID:", registrationResult.user.id);
      console.log("   Doctor ID:", registrationResult.user.doctorId);
      console.log("   Role:", registrationResult.user.role);
    } else {
      const error = await registerResponse.json();
      console.log("❌ Patient registration failed:", error);
    }

    console.log("\n3. Testing validation - registration without doctorId");
    const invalidPatient = {
      firstName: "Invalid",
      lastName: "Patient",
      name: "Invalid Patient",
      email: "invalidpatient@example.com",
      password: "password123",
      phone: "1234567890",
      role: "patient"
      // Missing doctorId
    };

    const invalidResponse = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidPatient)
    });

    if (!invalidResponse.ok) {
      const error = await invalidResponse.json();
      console.log("✅ Validation working - registration rejected without doctorId:", error.message);
    } else {
      console.log("❌ Validation failed - registration should have been rejected");
    }

    console.log("\n4. Testing validation - invalid doctorId");
    const invalidDoctorPatient = {
      firstName: "Invalid",
      lastName: "Doctor",
      name: "Invalid Doctor Patient",
      email: "invaliddoctor@example.com",
      password: "password123",
      phone: "1234567890",
      role: "patient",
      doctorId: 99999 // Non-existent doctor ID
    };

    const invalidDoctorResponse = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidDoctorPatient)
    });

    if (!invalidDoctorResponse.ok) {
      const error = await invalidDoctorResponse.json();
      console.log("✅ Validation working - registration rejected with invalid doctorId:", error.message);
    } else {
      console.log("❌ Validation failed - registration should have been rejected with invalid doctorId");
    }

  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

testDoctorAssignment(); 