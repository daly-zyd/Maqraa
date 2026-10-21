"""Adapters that deliver one-time codes. Adapters never import apps (see import-linter contracts)."""
import logging

logger = logging.getLogger("maqraa.otp")


def log_sender(phone_e164: str, text: str) -> None:
    """Development sender: writes the message to the log instead of WhatsApp."""
    logger.warning("OTP to %s: %s", phone_e164, text)
