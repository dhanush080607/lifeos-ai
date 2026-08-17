from typing import Literal

from pydantic import BaseModel, Field


class Task(BaseModel):
    title: str = Field(
        description=(
            "A concrete action the user needs to complete."
        )
    )

    priority: Literal["low", "medium", "high"] = Field(
        description=(
            "Priority based on urgency, importance, "
            "deadlines, and dependencies."
        )
    )

    estimated_minutes: int = Field(
        ge=1,
        description=(
            "Estimated time required to complete the task "
            "in minutes. Must be at least 1."
        )
    )

    deadline: str = Field(
        default="Not specified",
        description=(
            "The deadline associated with this specific task, "
            "exactly as understood from the user's input. "
            "Use 'Not specified' if the task has no deadline."
        )
    )


class Deadline(BaseModel):
    title: str = Field(
        description=(
            "The task, event, or goal associated with "
            "the deadline."
        )
    )

    deadline: str = Field(
        description=(
            "The deadline exactly as understood from "
            "the user's input."
        )
    )


class ContextResponse(BaseModel):
    goals: list[str] = Field(
        description=(
            "The user's main goals identified from the input."
        )
    )

    tasks: list[Task] = Field(
        description=(
            "Concrete actionable tasks identified from "
            "the user's input."
        )
    )

    deadlines: list[Deadline] = Field(
        description=(
            "Deadlines explicitly stated or clearly implied "
            "by the user's input."
        )
    )

    available_time: str = Field(
        description=(
            "The amount of time the user says they have "
            "available. Use 'Not specified' if missing."
        )
    )

    recommended_action: str = Field(
        description=(
            "The single most important concrete action "
            "the user should take next."
        )
    )

    reasoning: str = Field(
        description=(
            "A concise explanation of why the recommended "
            "action was chosen."
        )
    )