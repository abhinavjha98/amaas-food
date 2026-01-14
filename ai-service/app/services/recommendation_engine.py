"""
Rule-based recommendation engine for Curry Pot.

Phase 1: Rule-based recommendations
- Filter by dietary preferences
- Spice level matching
- Preferred cuisine matching
- Popularity-based ranking
"""
import os
import requests
from typing import List, Dict, Any, Optional

class RuleBasedRecommendationEngine:
    """Rule-based recommendation engine"""
    
    def __init__(self):
        self.backend_api_url = os.getenv('BACKEND_API_URL', 'http://localhost:5000/api')
    
    def get_recommendations(
        self,
        user_id: int,
        lat: Optional[float] = None,
        lon: Optional[float] = None,
        limit: int = 10,
        preferences: Dict[str, Any] = {}
    ) -> List[Dict[str, Any]]:
        """
        Get recommendations using rule-based filtering.
        
        In a real implementation, this would:
        1. Fetch user's order history and preferences
        2. Fetch all available dishes
        3. Filter and score dishes based on rules
        4. Return top N recommendations
        """
        try:
            # In production, this would fetch from the main backend API
            # For now, we'll simulate recommendations
            
            dietary_prefs = preferences.get('dietary_preferences', '')
            spice_level = preferences.get('spice_level', '')
            allergens = preferences.get('allergens', [])
            preferred_cuisines = preferences.get('preferred_cuisines', '')
            
            # Build query parameters
            params = {
                'limit': limit * 2  # Get more to filter
            }
            
            if lat and lon:
                params['lat'] = lat
                params['lon'] = lon
                params['radius'] = 10  # 10 km radius
            
            if dietary_prefs:
                params['dietary_type'] = dietary_prefs.lower()
            
            if spice_level:
                params['spice_level'] = spice_level.lower()
            
            # Try to fetch from backend API
            try:
                response = requests.get(
                    f'{self.backend_api_url}/dishes',
                    params=params,
                    timeout=5
                )
                if response.status_code == 200:
                    dishes = response.json().get('dishes', [])
                    
                    # Score and rank dishes
                    scored_dishes = []
                    for dish in dishes:
                        score = self._calculate_score(dish, preferences)
                        scored_dishes.append((dish, score))
                    
                    # Sort by score and return top N
                    scored_dishes.sort(key=lambda x: x[1], reverse=True)
                    recommendations = [dish for dish, score in scored_dishes[:limit]]
                    
                    return recommendations
            except:
                # Fallback if backend is not available
                pass
            
            # Return empty recommendations if backend unavailable
            return []
            
        except Exception as e:
            print(f"Error in recommendation engine: {e}")
            return []
    
    def _calculate_score(self, dish: Dict[str, Any], preferences: Dict[str, Any]) -> float:
        """Calculate recommendation score for a dish"""
        score = 0.0
        
        # Base score from ratings (0-50)
        rating = dish.get('average_rating', 0)
        score += rating * 10
        
        # Popularity boost (0-20)
        order_count = dish.get('order_count', 0)
        score += min(order_count * 0.1, 20)
        
        # View count boost (0-10)
        view_count = dish.get('view_count', 0)
        score += min(view_count * 0.01, 10)
        
        # Dietary preference match (0-15)
        dietary_pref = preferences.get('dietary_preferences', '').lower()
        dish_type = dish.get('dietary_type', '').lower()
        if dietary_pref and dish_type == dietary_pref:
            score += 15
        
        # Spice level match (0-10)
        pref_spice = preferences.get('spice_level', '').lower()
        dish_spice = dish.get('spice_level', '').lower()
        if pref_spice and dish_spice == pref_spice:
            score += 10
        
        # Cuisine preference match (0-30) - CRITICAL for proper filtering
        preferred_cuisines = preferences.get('preferred_cuisines', [])
        if preferred_cuisines and dish.get('producer'):
            producer_specialty = dish.get('producer', {}).get('cuisine_specialty', '')
            if producer_specialty:
                # Check if producer cuisine matches any preferred cuisine
                producer_specialty_lower = str(producer_specialty).lower()
                cuisine_match = False
                
                # Handle list or string format
                cuisines_to_check = preferred_cuisines if isinstance(preferred_cuisines, list) else [preferred_cuisines]
                
                for user_cuisine in cuisines_to_check:
                    user_cuisine_lower = str(user_cuisine).lower()
                    # Check for exact match or substring match (but avoid North/South conflicts)
                    if 'south' in user_cuisine_lower and 'north' in producer_specialty_lower:
                        continue  # Skip - conflict
                    if 'north' in user_cuisine_lower and 'south' in producer_specialty_lower:
                        continue  # Skip - conflict
                    
                    if user_cuisine_lower in producer_specialty_lower or producer_specialty_lower in user_cuisine_lower:
                        score += 30  # Strong boost for matching cuisine
                        cuisine_match = True
                        break
                
                # Heavy penalty if no match (but this should be filtered out earlier)
                if not cuisine_match:
                    score -= 40  # Strong penalty for mismatched cuisine
        
        # Allergen avoidance penalty (-50 if allergen present)
        allergens = preferences.get('allergens', [])
        dish_allergens = dish.get('allergens', [])
        if allergens and dish_allergens:
            for allergen in allergens:
                if allergen.lower() in [a.lower() for a in dish_allergens]:
                    score -= 50
                    break
        
        return score

