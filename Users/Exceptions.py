from rest_framework.exceptions import APIException


class DuplicatePhoneException(APIException):
    status_code = 400
    default_code = 'phone_error'
    default_detail = 'Phone number is already in use'



class UserCredentialException(APIException):
    status_code = 400
    default_detail = 'PIN and phone number we not found'
    default_code = 'credential_error'