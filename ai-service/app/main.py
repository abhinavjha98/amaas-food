from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Curry Pot AI Recommendation Service", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class RecommendationRequest(BaseModel):
    user_id: int
    lat: Optional[float] = None
    lon: Optional[float] = None
    limit: int = 10
    preferences: Optional[Dict[str, Any]] = None

class RecommendationResponse(BaseModel):
    recommendations: List[Dict[str, Any]]
    source: str
    user_id: int

@app.get("/")
def root():
    return {"message": "Curry Pot AI Recommendation Service", "status": "running"}

@app.post("/recommend", response_model=RecommendationResponse)
async def get_recommendations(request: RecommendationRequest):
    """
    Get personalized dish recommendations for a user.
    
    Phase 1: Rule-based recommendations
    Phase 2: Feedback-based personalization (future)
    Phase 3: ML-based collaborative filtering (future)
    """
    try:
        # Import recommendation engine
        from app.services.recommendation_engine import RuleBasedRecommendationEngine
        
        engine = RuleBasedRecommendationEngine()
        recommendations = engine.get_recommendations(
            user_id=request.user_id,
            lat=request.lat,
            lon=request.lon,
            limit=request.limit,
            preferences=request.preferences or {}
        )
        
        return RecommendationResponse(
            recommendations=recommendations,
            source="rule-based",
            user_id=request.user_id
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation error: {str(e)}")

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "ai-recommendation"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)




