from datetime import datetime, timezone
from typing import Any

from bson import ObjectId
from bson.errors import InvalidId


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def serialize_doc(doc: dict[str, Any] | None) -> dict[str, Any] | None:
    if not doc:
        return None
    out = {**doc}
    out["id"] = str(out.pop("_id"))
    return out


def parse_object_id(value: str) -> ObjectId:
    try:
        return ObjectId(value)
    except (InvalidId, TypeError) as exc:
        raise ValueError("Invalid ID format") from exc
