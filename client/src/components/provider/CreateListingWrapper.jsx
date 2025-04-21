import React from 'react';
import CreateListing from '../CreateListing';
import ProviderLayout from './ProviderLayout';

function CreateListingWrapper() {
  return (
    <ProviderLayout>
      <CreateListing />
    </ProviderLayout>
  );
}

export default CreateListingWrapper;
