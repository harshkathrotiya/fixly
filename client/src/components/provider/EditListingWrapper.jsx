import React from 'react';
import EditListing from '../EditListing';
import ProviderLayout from './ProviderLayout';

function EditListingWrapper() {
  return (
    <ProviderLayout>
      <EditListing />
    </ProviderLayout>
  );
}

export default EditListingWrapper;
