from rest_framework.permissions import BasePermission


class HasUserType(BasePermission):
    allowed_user_types = ()
    message = "Accès non autorisé"

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.user_type in self.allowed_user_types
        )


class IsAdminUserType(HasUserType):
    allowed_user_types = ("admin",)


class IsTeacherUserType(HasUserType):
    allowed_user_types = ("teacher",)


class IsStudentUserType(HasUserType):
    allowed_user_types = ("student",)


class IsAdminOrTeacherUserType(HasUserType):
    allowed_user_types = ("admin", "teacher")
