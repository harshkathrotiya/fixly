#!/bin/bash

# List of files to update
files=(
    "client/src/components/ServiceDetails.jsx"
    "client/src/components/ProtectedAdminRoute.jsx"
    "client/src/components/MyBookings.jsx"
    "client/src/components/reviewform.jsx"
    "client/src/components/Bookings.jsx"
    "client/src/components/ComplaintForm.jsx"
    "client/src/components/Reviews.jsx"
    "client/src/components/PaymentForm.jsx"
    "client/src/components/admin/Header.jsx"
    "client/src/components/admin/Complaints.jsx"
    "client/src/components/admin/Users.jsx"
    "client/src/components/admin/Listings.jsx"
    "client/src/components/admin/AdminLayout.jsx"
    "client/src/components/admin/Bookings.jsx"
    "client/src/components/admin/Providers.jsx"
    "client/src/components/admin/Categories.jsx"
    "client/src/components/admin/Commissions.jsx"
    "client/src/components/admin/CreateAdminUser.jsx"
    "client/src/components/admin/Dashboard.jsx"
    "client/src/components/admin/Services.jsx"
    "client/src/components/provider/AddService.jsx"
    "client/src/components/provider/ProviderLayout.jsx"
    "client/src/components/provider/ProviderDashboard.jsx"
    "client/src/components/provider/ProviderBookings.jsx"
    "client/src/components/provider/ServiceManagement.jsx"
    "client/src/components/provider/EditService.jsx"
    "client/src/components/ProviderDashboard.jsx"
    "client/src/components/login.jsx"
    "client/src/components/Navbar.jsx"
    "client/src/components/services.jsx"
    "client/src/components/Home.jsx"
)

# Update each file
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        # Replace the import statement
        sed -i '' 's/from ['\''"].*context\/authcontext['\''"];/from "..\/context\/AuthContext";/g' "$file"
        sed -i '' 's/from ['\''"].*context\/authcontext['\''"];/from "..\/..\/context\/AuthContext";/g' "$file"
        echo "Updated $file"
    else
        echo "File not found: $file"
    fi
done

echo "Import statements updated."
