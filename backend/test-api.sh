#!/bin/bash

# Elisha-Fit Backend API Test Script
# Make sure your backend server is running on http://localhost:8080

BASE_URL="http://localhost:8080/api/v1"
TOKEN=""

echo "🚀 Testing Elisha-Fit Backend API"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

# Test 1: Register a new user
echo -e "\n${YELLOW}1. Testing User Registration${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "test@elisha-fit.com",
        "password": "testpassword123",
        "name": "Test User"
    }')
echo "Response: $REGISTER_RESPONSE"

# Test 2: Login to get JWT token
echo -e "\n${YELLOW}2. Testing User Login${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "test@elisha-fit.com",
        "password": "testpassword123"
    }')
echo "Response: $LOGIN_RESPONSE"

# Extract token from login response
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Failed to extract token from login response${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Token extracted: ${TOKEN:0:20}...${NC}"

# Test 3: Create a new program
echo -e "\n${YELLOW}3. Testing Program Creation${NC}"
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/workouts" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
        "name": "Full Body Strength",
        "description": "A comprehensive 4-week full body strength program",
        "category": "strength",
        "difficulty": "beginner",
        "isPublic": false,
        "exercises": [
            {
                "exerciseId": "507f1f77bcf86cd799439011",
                "name": "Barbell Squat",
                "sets": 3,
                "reps": 10,
                "rest": 90,
                "notes": "Focus on form and depth"
            },
            {
                "exerciseId": "507f1f77bcf86cd799439012",
                "name": "Bench Press",
                "sets": 3,
                "reps": 8,
                "rest": 120,
                "notes": "Control the descent"
            },
            {
                "exerciseId": "507f1f77bcf86cd799439013",
                "name": "Deadlift",
                "sets": 3,
                "reps": 6,
                "rest": 180,
                "notes": "Keep back straight"
            }
        ]
    }')
echo "Response: $CREATE_RESPONSE"

# Extract program ID from create response
WORKOUT_ID=$(echo $CREATE_RESPONSE | grep -o '"_id":"[^"]*"' | cut -d'"' -f4)
if [ -z "$WORKOUT_ID" ]; then
    echo -e "${RED}❌ Failed to extract workout ID from create response${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Workout ID extracted: $WORKOUT_ID${NC}"

# Test 4: Get all workouts
echo -e "\n${YELLOW}4. Testing Get All Workouts${NC}"
GET_ALL_RESPONSE=$(curl -s -X GET "$BASE_URL/workouts" \
    -H "Authorization: Bearer $TOKEN")
echo "Response: $GET_ALL_RESPONSE"

# Test 5: Get specific workout
echo -e "\n${YELLOW}5. Testing Get Specific Workout${NC}"
GET_ONE_RESPONSE=$(curl -s -X GET "$BASE_URL/workouts/$WORKOUT_ID" \
    -H "Authorization: Bearer $TOKEN")
echo "Response: $GET_ONE_RESPONSE"

# Test 6: Update workout
echo -e "\n${YELLOW}6. Testing Workout Update${NC}"
UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/workouts/$WORKOUT_ID" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"name": "Updated Full Body Strength"}')
echo "Response: $UPDATE_RESPONSE"

# Test 7: Test validation error (missing required field)
echo -e "\n${YELLOW}7. Testing Validation Error${NC}"
VALIDATION_RESPONSE=$(curl -s -X POST "$BASE_URL/programs" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
        "description": "This should fail validation",
        "exercises": []
    }')
echo "Response: $VALIDATION_RESPONSE"

# Test 8: Test unauthorized access
echo -e "\n${YELLOW}8. Testing Unauthorized Access${NC}"
UNAUTHORIZED_RESPONSE=$(curl -s -X GET "$BASE_URL/programs" \
    -H "Authorization: Bearer invalid-token")
echo "Response: $UNAUTHORIZED_RESPONSE"

# Test 7: Delete workout
echo -e "\n${YELLOW}7. Testing Workout Deletion${NC}"
DELETE_RESPONSE=$(curl -s -X DELETE "$BASE_URL/workouts/$WORKOUT_ID" \
    -H "Authorization: Bearer $TOKEN")
echo "Response: $DELETE_RESPONSE"

# Test 10: Verify program is deleted
echo -e "\n${YELLOW}10. Verifying Program Deletion${NC}"
VERIFY_DELETE_RESPONSE=$(curl -s -X GET "$BASE_URL/programs/$PROGRAM_ID" \
    -H "Authorization: Bearer $TOKEN")
echo "Response: $VERIFY_DELETE_RESPONSE"

echo -e "\n${GREEN}🎉 API Testing Complete!${NC}"
echo -e "${YELLOW}Check the responses above to verify all endpoints are working correctly.${NC}" 