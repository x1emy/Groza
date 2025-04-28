import logging
import re
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from django.core.cache import cache
from typing import List

logger = logging.getLogger(__name__)

class ChatGLMService:
    def __init__(self):
        # Initialize the tokenizer and model for direct use with transformers
        self.model_name = "cointegrated/rut5-base"
        self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
        self.model = AutoModelForSeq2SeqLM.from_pretrained(self.model_name)

    def generate_list(self, prompt: str) -> List[str]:
        cache_key = f"flan_t5_{hash(prompt)}"
        
        if cached := cache.get(cache_key):
            return cached

        try:
          
            query = (
                f"Список только самых основных ингредиентов для приготовления {prompt} "
                f"в виде перечисления через запятую. Только названия продуктов, "
                f"без пояснений, без количества, без инструкций. "
                f"Пример: мука, вода, соль, сахар."
            )

           
            inputs = self.tokenizer(query, return_tensors="pt", truncation=True, padding=True)
            generated_ids = self.model.generate(inputs['input_ids'], max_length=100, num_beams=5, no_repeat_ngram_size=2, early_stopping=True)

            
            generated_text = self.tokenizer.decode(generated_ids[0], skip_special_tokens=True)
            logger.debug(f"Raw generated text: {generated_text}")

            
            items = self._clean_response(generated_text)

            if items:
                cache.set(cache_key, items, timeout=3600)
                return items

        except Exception as e:
            logger.error(f"Error during generation: {str(e)}")

        return self._generate_with_fallback(prompt)

    def _clean_response(self, text: str) -> List[str]:
       
        text = re.split(r"[:.]", text, maxsplit=1)[-1].strip()

       
        unwanted_phrases = [
            "ингредиенты", "состав", "продукты", "нужны", "для приготовления",
            "для", "рецепт", "включает", "может включать", "обычно включает"
        ]

        for phrase in unwanted_phrases:
            text = text.replace(phrase, "")

        
        items = re.split(r"[,.\n]", text)

        cleaned_items = []
        for item in items:
            item = item.strip().lower()
            if item and len(item) > 2 and not any(unwanted in item for unwanted in unwanted_phrases):
                cleaned_items.append(item)

        return cleaned_items[:15]  

    def _generate_with_fallback(self, prompt: str) -> List[str]:
        # Фолбек для популярных блюд
        fallback_recipes = {
            "пицца": ["тесто для пиццы", "томатный соус", "сыр моцарелла", 
                     "пепперони", "шампиньоны", "оливки"],
            "борщ": ["говядина", "свекла", "капуста", "картофель", 
                    "морковь", "лук", "сметана"],
            "паста": ["макароны", "фарш мясной", "томатный соус", 
                     "лук", "чеснок", "сыр пармезан"],
            "салат": ["помидоры", "огурцы", "лук", "масло оливковое", 
                     "соль", "перец"]
        }
        
        prompt_lower = prompt.lower()
        for dish, ingredients in fallback_recipes.items():
            if dish in prompt_lower:
                return ingredients
        return ["молоко", "хлеб", "яйца", "масло"]

chatglm_service = ChatGLMService()

def generate_shopping_list(prompt: str) -> List[str]:
    return chatglm_service.generate_list(prompt)
