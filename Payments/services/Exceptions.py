from rest_framework.exceptions import APIException

class PaymentCredentialException(Exception):
    pass


class SchoolExceptionError(APIException):
    status_code = 400
    default_code =  'school_error'
    default_detail ='Something went wrong'

class SchoolNotFoundException(APIException):
    status_code = 400
    default_detail = 'School Does not exist'
    default_code = 'school_error'

class RequestTimeoutException(APIException):
    default_code = ''
    status_code = ''
    default_detail = ''


class UserNotFound(APIException):
    default_code = 'user_error'
    status_code = 404
    default_detail = 'Credentials were not provided.Please login'

class PayChanguWebhookException(APIException):
    status_code = 400
    default_detail = 'Invalid signature'
    default_code = 'signature_error'