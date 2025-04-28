import os
import requests
from dotenv import load_dotenv
from django.core.cache import cache
from typing import List, Optional
import logging

load_dotenv()
logger = logging.getLogger(__name__)

class HuggingFaceService:
    def __init__(self):
        self.api_key = os.getenv("HF_API_KEY")
        self.model = os.getenv("HF_MODEL_NAME", "sberbank-ai/rugpt3small")
        self.api_url = f"https://api-inference.huggingface.co/models/{self.model}"
        print(f"API KEY: {self.api_key}")
        self.headers = {"Authorization": f"Bearer {self.api_key}"}

    def _generate_with_fallback(self, prompt: str) -> List[str]:
        prompt_lower = prompt.lower()
        if "борщ" in prompt_lower:
            return ["говядина", "свекла", "капуста", "сметана"]
        elif "пирог" in prompt_lower:
            return ["мука", "яйца", "сахар", "яблоки"]
        return ["молоко", "хлеб", "яйца"]
    
    def generate_list(self, prompt: str) -> List[str]:
        cache_key = f"hf_{hash(prompt)}"
        
        if cached := cache.get(cache_key):
            return cached

        try:
            payload = {
                "inputs": f"Составь список продуктов для: {prompt}. "
                         "Только названия через запятую, без номеров и пояснений. "
                         "Формат: 'продукт1, продукт2, продукт3'",
                "parameters": {
                    "max_length": 100,
                    "temperature": 0.7
                }
            }

            response = requests.post(
                self.api_url,
                headers=self.headers,
                json=payload,
                timeout=10
            )
            response.raise_for_status()

            result = response.json()
            if isinstance(result, list) and len(result) > 0:
                items_text = result[0].get("generated_text", "")
                items = [item.strip() for item in items_text.split(",") if item.strip()]
                
                if items:
                    cache.set(cache_key, items, timeout=3600)
                    return items

        except requests.exceptions.RequestException as e:
            logger.error(f"HuggingFace API error: {str(e)}")
        
        return self._generate_with_fallback(prompt)

# Создаём один объект
huggingface_service = HuggingFaceService()

# А вот это то, чего не хватало!
def generate_shopping_list(prompt: str) -> List[str]:
    return huggingface_service.generate_list(prompt)
