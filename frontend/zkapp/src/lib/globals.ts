import type { CoreAPIClient } from "@apis/core-api-client";
import { appStatus, AppStatus } from "$lib/utilities/app-status";

export { 
  apiClient,
  setApiClient,
  appStatus,
  AppStatus 
};

// the global API client, established at startup
let apiClient: CoreAPIClient; 

function setApiClient(client: CoreAPIClient) {
  apiClient = client;
}

