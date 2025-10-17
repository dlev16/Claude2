#!/bin/bash

SUPABASE_URL="https://veutiatioxdbuxftlear.supabase.co"
SERVICE_KEY="sbp_7398e9bf7c3e6e140a2215f85ef425ab8dff6331"

echo "🚀 Creating test users..."
echo ""

# Function to create user
create_user() {
    local email=$1
    local password=$2
    local full_name=$3
    local role=$4

    echo "Creating $role: $email"

    # Create user
    response=$(curl -s -X POST "$SUPABASE_URL/auth/v1/admin/users" \
        -H "apikey: $SERVICE_KEY" \
        -H "Authorization: Bearer $SERVICE_KEY" \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"$email\",
            \"password\": \"$password\",
            \"email_confirm\": true,
            \"user_metadata\": {
                \"full_name\": \"$full_name\"
            }
        }")

    # Check if user was created
    if echo "$response" | grep -q '"id"'; then
        user_id=$(echo "$response" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
        echo "  ✓ User created: $user_id"

        # Assign role
        instructor_name_field=""
        if [ "$role" = "instructor" ]; then
            instructor_name_field=",\"instructor_name\": \"$full_name\""
        fi

        role_response=$(curl -s -X POST "$SUPABASE_URL/rest/v1/user_roles" \
            -H "apikey: $SERVICE_KEY" \
            -H "Authorization: Bearer $SERVICE_KEY" \
            -H "Content-Type: application/json" \
            -H "Prefer: return=minimal" \
            -d "{\"user_id\": \"$user_id\", \"role\": \"$role\"$instructor_name_field}")

        echo "  ✓ Role assigned: $role"
    elif echo "$response" | grep -qi "already"; then
        echo "  ⚠️  User already exists"
    else
        echo "  ❌ Error: $response"
    fi

    echo ""
}

# Create users
create_user "admin@clip.edu" "ClipAdmin2024!" "System Administrator" "admin"
create_user "office@clip.edu" "ClipOffice2024!" "Office Staff" "office"
create_user "instructor@clip.edu" "ClipInstructor2024!" "John Instructor" "instructor"

echo "============================================================"
echo "✅ SETUP COMPLETE!"
echo "============================================================"
echo ""
echo "You can now login with these credentials:"
echo ""
echo "👤 ADMIN:"
echo "   Email:    admin@clip.edu"
echo "   Password: ClipAdmin2024!"
echo ""
echo "👤 OFFICE:"
echo "   Email:    office@clip.edu"
echo "   Password: ClipOffice2024!"
echo ""
echo "👤 INSTRUCTOR:"
echo "   Email:    instructor@clip.edu"
echo "   Password: ClipInstructor2024!"
echo ""
