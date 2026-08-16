from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.ai_service import analyze_context


router = APIRouter(prefix="/context", tags=["Context"])


class ContextRequest(BaseModel):
    text: str


@router.post("/analyze")
def analyze(request: ContextRequest):
    if not request.text.strip():
        raise HTTPException(
            status_code=400,
            detail="Input text cannot be empty.",
        )

    try:
        result = analyze_context(request.text)
        return result

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"AI analysis failed: {str(error)}",
        )