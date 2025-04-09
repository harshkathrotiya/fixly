#!/bin/bash

# List of admin files to update
admin_files=(
  "client/src/components/admin/Dashboard.jsx"
  "client/src/components/admin/Providers.jsx"
  "client/src/components/admin/Users.jsx"
  "client/src/components/admin/Listings.jsx"
  "client/src/components/admin/Bookings.jsx"
  "client/src/components/admin/Services.jsx"
  "client/src/components/admin/Complaints.jsx"
  "client/src/components/admin/Commissions.jsx"
  "client/src/components/admin/CreateAdminUser.jsx"
  "client/src/components/admin/Header.jsx"
)

# Update each file
for file in "${admin_files[@]}"; do
  if [ -f "$file" ]; then
    # Replace the import statement with correct casing
    sed -i '' 's/from ['\''"]..\/..\/context\/authcontext['\''"];/from "..\/..\/context\/AuthContext";/g' "$file"
    echo "Updated $file"
  else
    echo "File not found: $file"
  fi
done

echo "Admin import statements updated."