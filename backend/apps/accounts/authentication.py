from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.authentication import JWTAuthentication


class VersionedJWTAuthentication(JWTAuthentication):
    """Rejects tokens whose `tv` claim differs from the user's current token_version."""

    def get_user(self, validated_token):
        user = super().get_user(validated_token)
        if validated_token.get("tv") != user.token_version:
            raise AuthenticationFailed("token revoked", code="token_revoked")
        return user
