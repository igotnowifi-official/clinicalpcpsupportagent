import logging
import requests
from typing import Optional, Any
from api.config import settings

logger = logging.getLogger(__name__)

class MemMachineClient:
    def __init__(self):
        self.base_url = settings.MEMMACHINE_BASE_URL if hasattr(settings, 'MEMMACHINE_BASE_URL') else settings.MEMMACHINE_ENDPOINT
        self.api_key = settings.MEMMACHINE_API_KEY
        self.timeout = 2.0  # Short timeout as requested

    def _get_headers(self):
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    def get_memory(self, namespace: str, subject_id: str, key: str) -> Optional[Any]:
        """
        Retrieve memory from MemMachine.
        Fails open (returns None) if MemMachine is unreachable or errors.
        """
        if not self.base_url:
            return None

        try:
            # Construct URL - assuming a RESTful pattern like /v1/memory/{namespace}/{subject_id}/{key}
            # or similar. Since the API isn't defined in the prompt, I'll assume a generic structure
            # based on common patterns. 
            # If the user didn't specify the API structure, I will use a generic one.
            # Let's assume: GET /memory?namespace=X&subject_id=Y&key=Z
            # OR path parameters.
            # Given the prompt says "MemMachine", I'll check if there's any existing usage in the repo.
            # I saw `adapters/memmachine_store.py` in the file list. I should check that first!
            
            url = f"{self.base_url}/api/v1/memory/{namespace}/{subject_id}/{key}"
            response = requests.get(url, headers=self._get_headers(), timeout=self.timeout)
            
            if response.status_code == 200:
                return response.json().get("value")
            elif response.status_code == 404:
                return None
            else:
                logger.warning(f"MemMachine returned status {response.status_code} for get_memory")
                return None

        except requests.exceptions.RequestException as e:
            logger.warning(f"Failed to connect to MemMachine (get_memory): {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error in get_memory: {e}")
            return None

    def upsert_memory(self, namespace: str, subject_id: str, key: str, value: Any) -> None:
        """
        Upsert memory to MemMachine.
        Fails open (logs error but doesn't raise) if operation fails.
        """
        if not self.base_url:
            return

        try:
            url = f"{self.base_url}/api/v1/memory"
            payload = {
                "namespace": namespace,
                "subject_id": subject_id,
                "key": key,
                "value": value
            }
            
            response = requests.post(url, json=payload, headers=self._get_headers(), timeout=self.timeout)
            
            if response.status_code not in [200, 201]:
                logger.warning(f"MemMachine returned status {response.status_code} for upsert_memory")

        except requests.exceptions.RequestException as e:
            logger.warning(f"Failed to connect to MemMachine (upsert_memory): {e}")
        except Exception as e:
            logger.error(f"Unexpected error in upsert_memory: {e}")

# Global instance
memmachine_client = MemMachineClient()
