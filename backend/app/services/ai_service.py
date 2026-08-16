from google import genai
from google.genai import types
from pydantic_settings import BaseSettings

from app.schemas.context import ContextResponse


class Settings(BaseSettings):
    gemini_api_key: str

    class Config:
        env_file = ".env"


settings = Settings()

client = genai.Client(api_key=settings.gemini_api_key)


def analyze_context(user_text: str) -> ContextResponse:
    prompt = f"""
You are the Context Intelligence Engine for LifeOS.

LifeOS converts scattered personal information into clear, prioritized actions.

Analyze the user's input and extract:

1. Main goals
2. Concrete actionable tasks
3. Deadlines
4. Available time or constraints
5. The single most important next action
6. A concise explanation for that recommendation

Important rules:

- Do not invent deadlines that the user did not provide.
- Do not invent tasks that have no reasonable connection to the input.
- If information is missing, use an empty list or "Not specified".
- Prioritize tasks based on urgency, importance, deadlines, and dependencies.
- The recommended action must be a concrete action.
- Estimated time should be realistic.
- Return only the requested structured data.

USER INPUT:
{user_text}
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=ContextResponse,
        ),
    )

    if response.parsed is None:
        raise ValueError("AI returned an invalid structured response.")

    return response.parsed