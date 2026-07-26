from rest_framework.exceptions import APIException


class DuplicatePhoneException(APIException):
    status_code = 400
    default_code = "phone_error"
    default_detail = "Phone number is already in use"


class InvalidPhoneException(APIException):
    status_code = 400
    default_code = "phone_error"
    default_detail = "Invalid Malawian phone number"


class InvalidCredentialsException(APIException):
    status_code = 400
    default_code = "credential_error"
    default_detail = "Phone number and password were not found"


class SessionExpiredException(APIException):
    status_code = 401
    default_code = "session_error"
    default_detail = "Session expired, please log in again"


class StaffPermissionException(APIException):
    status_code = 403
    default_code = "permission_error"
    default_detail = "You do not have permission to perform this action"
