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

LifeOS converts scattered personal information into clear,
prioritized actions.

Analyze the user's input and extract:

1. Main goals
2. Concrete actionable tasks
3. Deadlines
4. Available time or constraints
5. The single most important next action
6. A concise explanation for that recommendation

IMPORTANT TASK RULES:

- Every task must represent a concrete action.
- Assign a realistic estimated time in minutes.
- Assign a priority: low, medium, or high.
- If a task has a deadline mentioned by the user, attach that
  deadline to the task.
- If a task has no known deadline, use "Not specified".
- Do not invent deadlines.
- Do not invent tasks unrelated to the user's input.
- Do not invent available time.
- If available time is missing, use "Not specified".

IMPORTANT DEADLINE RULES:

- Extract only deadlines explicitly stated or clearly implied
  by the user's input.
- Preserve the user's wording when possible.
- Examples:
    "tomorrow"
    "Friday"
    "next Monday"
    "August 20"
- Do not convert an unspecified deadline into a date.
- Do not assume every task has a deadline.

IMPORTANT PRIORITY RULES:

- Consider urgency.
- Consider deadlines.
- Consider importance.
- Consider dependencies.
- A task due sooner should generally receive greater urgency
  than an otherwise similar task due later.
- The recommended action must be a concrete action.

IMPORTANT RECOMMENDATION RULES:

Choose the single most important action the user should take
next based on urgency, importance, deadline, and dependencies.

Return only the requested structured data.

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