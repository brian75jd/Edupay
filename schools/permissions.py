from rest_framework.permissions import SAFE_METHODS, BasePermission


class IsAdminOrReadOnly(BasePermission):
    """Anyone can read (search/view schools); only EduPay staff can write
    (approve/deny/suspend, or manage payment methods directly).
    School self-registration is handled separately via AllowAny on create.
    """

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)
